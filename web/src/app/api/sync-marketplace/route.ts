import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, getServiceClient } from "@/lib/api-helpers";

// ---------------------------------------------------------------------------
// 상수
// ---------------------------------------------------------------------------
const SHEET_CSV_URL =
  "https://docs.google.com/spreadsheets/d/1XMDC5nmATprv9sEkw6jDgxDQKr5ZFaUnIX_HWScuq9E/export?format=csv";

const MARGIN_RATE = 1.5;

// ---------------------------------------------------------------------------
// 타입
// ---------------------------------------------------------------------------
interface ParsedRow {
  domain: string;
  da: number | null;
  pa: number | null;
  rd: number | null;
  price: number | null;
  ageYears: number | null;
  niche: string | null;
  registrant: string | null;
  backlinksFrom: string | null;
}

interface SyncSummary {
  total: number;
  inserted: number;
  updated: number;
  deactivated: number;
  skipped: number;
  errors: number;
}

// ---------------------------------------------------------------------------
// CSV 파싱 (외부 패키지 미사용 — 따옴표·쉼표 처리 포함)
// ---------------------------------------------------------------------------

/**
 * CSV 한 줄을 컬럼 배열로 파싱한다.
 * RFC 4180 준수: 따옴표로 감싸진 필드 내 쉼표/줄바꿈 처리.
 */
function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let i = 0;
  while (i < line.length) {
    if (line[i] === '"') {
      // 따옴표로 시작하는 필드
      let field = "";
      i++; // 여는 따옴표 건너뜀
      while (i < line.length) {
        if (line[i] === '"' && line[i + 1] === '"') {
          // 이스케이프된 따옴표
          field += '"';
          i += 2;
        } else if (line[i] === '"') {
          i++; // 닫는 따옴표 건너뜀
          break;
        } else {
          field += line[i];
          i++;
        }
      }
      result.push(field.trim());
      // 다음 쉼표 건너뜀
      if (line[i] === ",") i++;
    } else {
      // 따옴표 없는 일반 필드
      const end = line.indexOf(",", i);
      if (end === -1) {
        result.push(line.slice(i).trim());
        break;
      }
      result.push(line.slice(i, end).trim());
      i = end + 1;
    }
  }
  return result;
}

function parseNumber(raw: string | undefined): number | null {
  if (!raw) return null;
  const cleaned = raw.replace(/[^0-9.]/g, "");
  const n = parseFloat(cleaned);
  return isNaN(n) ? null : n;
}

/**
 * "18 Years" → 18, "2.5" → 2, "3" → 3
 */
function parseAge(raw: string | undefined): number | null {
  if (!raw) return null;
  const match = raw.match(/(\d+(\.\d+)?)/);
  if (!match) return null;
  return Math.floor(parseFloat(match[1]));
}

/**
 * "$1,500" → 1500
 */
function parsePrice(raw: string | undefined): number | null {
  if (!raw) return null;
  const cleaned = raw.replace(/[$,]/g, "").trim();
  const n = parseFloat(cleaned);
  return isNaN(n) ? null : n;
}

/**
 * CSV 전체 텍스트를 파싱하여 유효한 행만 반환한다.
 *
 * 규칙:
 * - 행 0: 헤더 → 스킵
 * - 행 1: "Note:" 텍스트 → 스킵
 * - 행 2~4: 빈 행 가능 → 도메인명 없으면 스킵
 * - 이후: 도메인명이 없는 행은 스킵
 *
 * 컬럼 인덱스 (0-based):
 *   0: 도메인명
 *   1: DA
 *   2: PA
 *   3: RD
 *   4: Price
 *   5: Age
 *   6: Niche
 *   7: Registrant
 *   8+: Backlinks From (콤마 구분 여러 컬럼)
 */
function parseCsv(csvText: string): ParsedRow[] {
  const lines = csvText
    .split(/\r?\n/)
    .filter((line) => line.trim() !== "");

  const rows: ParsedRow[] = [];

  for (let idx = 0; idx < lines.length; idx++) {
    // 헤더 행 스킵
    if (idx === 0) continue;

    const cols = parseCsvLine(lines[idx]);
    const domainRaw = cols[0]?.trim() ?? "";

    // 빈 행 또는 Note: 텍스트 행 스킵
    if (!domainRaw || domainRaw.toLowerCase().startsWith("note:")) continue;

    // 도메인 형식 최소 검증 (점이 하나 이상 있어야 함)
    if (!domainRaw.includes(".")) continue;

    // Backlinks From: 8번 이후 컬럼을 모두 합쳐 콤마로 연결
    const backlinkParts = cols.slice(8).filter((c) => c.trim() !== "");
    const backlinksFrom =
      backlinkParts.length > 0 ? backlinkParts.join(", ") : null;

    rows.push({
      domain: domainRaw.toLowerCase(),
      da: parseNumber(cols[1]),
      pa: parseNumber(cols[2]),
      rd: parseNumber(cols[3]),
      price: parsePrice(cols[4]),
      ageYears: parseAge(cols[5]),
      niche: cols[6]?.trim() || null,
      registrant: cols[7]?.trim() || null,
      backlinksFrom,
    });
  }

  return rows;
}

// ---------------------------------------------------------------------------
// CRON_SECRET 인증 확인 (requireAdmin의 보완)
// ---------------------------------------------------------------------------
function isCronAuthenticated(request: NextRequest): boolean {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) return false;

  const authHeader = request.headers.get("authorization") ?? "";
  const token = authHeader.replace(/^Bearer\s+/i, "");
  return token === cronSecret;
}

// ---------------------------------------------------------------------------
// POST /api/sync-marketplace
// ---------------------------------------------------------------------------
export async function POST(request: NextRequest) {
  // 인증: CRON_SECRET Bearer 토큰 또는 어드민 세션
  const cronOk = isCronAuthenticated(request);
  if (!cronOk) {
    const { error: authError } = await requireAdmin();
    if (authError) return authError;
  }

  const importBatchId = new Date().toISOString();
  const summary: SyncSummary = {
    total: 0,
    inserted: 0,
    updated: 0,
    deactivated: 0,
    skipped: 0,
    errors: 0,
  };

  // ------------------------------------------------------------------
  // 1. Google Sheet CSV 다운로드
  // ------------------------------------------------------------------
  let csvText: string;
  try {
    const res = await fetch(SHEET_CSV_URL, {
      headers: { "User-Agent": "DomainChecker-Sync/1.0" },
      // Next.js 캐시 비활성화 — 항상 최신 데이터
      cache: "no-store",
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: "Google Sheet 다운로드 실패" },
        { status: 502 }
      );
    }
    csvText = await res.text();
  } catch {
    return NextResponse.json(
      { error: "Google Sheet 접근 중 오류" },
      { status: 502 }
    );
  }

  // ------------------------------------------------------------------
  // 2. CSV 파싱
  // ------------------------------------------------------------------
  const rows = parseCsv(csvText);
  summary.total = rows.length;

  if (rows.length === 0) {
    return NextResponse.json(
      { error: "파싱된 행이 없습니다. CSV 형식을 확인하세요." },
      { status: 422 }
    );
  }

  const client = getServiceClient();
  const sheetDomainNames = new Set<string>();

  // ------------------------------------------------------------------
  // 3. 각 행을 DB에 upsert
  // ------------------------------------------------------------------
  for (const row of rows) {
    try {
      const { domain } = row;
      sheetDomainNames.add(domain);

      const parts = domain.split(".");
      const tld = parts.length >= 2 ? parts[parts.length - 1] : "";

      // --- 3-1. domains 테이블 upsert ---
      let { data: domainRow } = await client
        .from("domains")
        .select("id")
        .eq("name", domain)
        .maybeSingle();

      let isNew = false;

      if (!domainRow) {
        const { data: created, error: createErr } = await client
          .from("domains")
          .insert({ name: domain, tld, status: "active", source: "other" })
          .select("id")
          .single();

        if (createErr || !created) {
          summary.errors++;
          continue;
        }
        domainRow = created;
        isNew = true;
      }

      const domainId = domainRow.id as string;

      // --- 3-2. domain_metrics 테이블 upsert ---
      const metricsPayload: Record<string, unknown> = {
        domain_id: domainId,
        updated_at: importBatchId,
      };
      if (row.da !== null) metricsPayload.moz_da = row.da;
      if (row.pa !== null) metricsPayload.moz_pa = row.pa;
      if (row.rd !== null) metricsPayload.ahrefs_ref_domains = row.rd;

      await client
        .from("domain_metrics")
        .upsert(metricsPayload, { onConflict: "domain_id" });

      // --- 3-3. marketplace_listings 테이블 upsert ---
      // 기존 source='csv_import' 리스팅 조회
      const { data: existingListing } = await client
        .from("marketplace_listings")
        .select("id")
        .eq("domain_id", domainId)
        .eq("source", "csv_import")
        .maybeSingle();

      const costPrice = row.price ?? 0;
      const askingPrice = Math.round(costPrice * MARGIN_RATE);

      const listingPayload: Record<string, unknown> = {
        domain_id: domainId,
        cost_price_usd: costPrice > 0 ? costPrice : null,
        asking_price: askingPrice > 0 ? askingPrice : null,
        niche: row.niche,
        domain_age_years: row.ageYears,
        registrant: row.registrant,
        backlinks_from: row.backlinksFrom,
        pa: row.pa,
        rd: row.rd,
        source: "csv_import",
        is_active: true,
        import_batch_id: importBatchId,
        updated_at: importBatchId,
      };

      if (existingListing) {
        const { error: updateErr } = await client
          .from("marketplace_listings")
          .update(listingPayload)
          .eq("id", existingListing.id);

        if (updateErr) {
          summary.errors++;
          continue;
        }
        summary.updated++;
      } else {
        const { error: insertErr } = await client
          .from("marketplace_listings")
          .insert({ ...listingPayload, listed_at: importBatchId });

        if (insertErr) {
          summary.errors++;
          continue;
        }
        if (isNew) {
          summary.inserted++;
        } else {
          // 도메인은 기존 것이지만 listing은 새로 추가
          summary.inserted++;
        }
      }
    } catch {
      summary.errors++;
    }
  }

  // ------------------------------------------------------------------
  // 4. 시트에 없는 csv_import 리스팅 비활성화
  // ------------------------------------------------------------------
  try {
    // source='csv_import'이고 is_active=true인 모든 리스팅 조회
    const { data: activeListings } = await client
      .from("marketplace_listings")
      .select("id, domains!inner(name)")
      .eq("source", "csv_import")
      .eq("is_active", true);

    const toDeactivate: string[] = [];

    if (activeListings) {
      for (const listing of activeListings) {
        const domainsRaw = listing.domains as unknown;
        const domainEntry =
          Array.isArray(domainsRaw) ? domainsRaw[0] : domainsRaw;
        const domainName =
          (domainEntry as { name: string } | null)?.name ?? "";
        if (domainName && !sheetDomainNames.has(domainName.toLowerCase())) {
          toDeactivate.push(listing.id as string);
        }
      }
    }

    if (toDeactivate.length > 0) {
      const { error: deactivateErr } = await client
        .from("marketplace_listings")
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .in("id", toDeactivate);

      if (!deactivateErr) {
        summary.deactivated = toDeactivate.length;
      }
    }
  } catch {
    // 비활성화 실패는 전체 실패로 처리하지 않음
  }

  return NextResponse.json({ ok: true, summary });
}
