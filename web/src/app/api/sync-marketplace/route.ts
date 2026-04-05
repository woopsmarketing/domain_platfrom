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
// CSV 파싱
// ---------------------------------------------------------------------------
function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let i = 0;
  while (i < line.length) {
    if (line[i] === '"') {
      let field = "";
      i++;
      while (i < line.length) {
        if (line[i] === '"' && line[i + 1] === '"') {
          field += '"';
          i += 2;
        } else if (line[i] === '"') {
          i++;
          break;
        } else {
          field += line[i];
          i++;
        }
      }
      result.push(field.trim());
      if (line[i] === ",") i++;
    } else {
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

function parseAge(raw: string | undefined): number | null {
  if (!raw) return null;
  const match = raw.match(/(\d+(\.\d+)?)/);
  if (!match) return null;
  return Math.floor(parseFloat(match[1]));
}

function parsePrice(raw: string | undefined): number | null {
  if (!raw) return null;
  const cleaned = raw.replace(/[$,]/g, "").trim();
  const n = parseFloat(cleaned);
  return isNaN(n) ? null : n;
}

function parseCsv(csvText: string): ParsedRow[] {
  const lines = csvText.split(/\r?\n/).filter((line) => line.trim() !== "");
  const rows: ParsedRow[] = [];

  for (let idx = 0; idx < lines.length; idx++) {
    if (idx === 0) continue;
    const cols = parseCsvLine(lines[idx]);
    const domainRaw = cols[0]?.trim() ?? "";
    if (!domainRaw || domainRaw.toLowerCase().startsWith("note:")) continue;
    if (!domainRaw.includes(".")) continue;

    const backlinkParts = cols.slice(8).filter((c) => c.trim() !== "");
    rows.push({
      domain: domainRaw.toLowerCase(),
      da: parseNumber(cols[1]),
      pa: parseNumber(cols[2]),
      rd: parseNumber(cols[3]),
      price: parsePrice(cols[4]),
      ageYears: parseAge(cols[5]),
      niche: cols[6]?.trim() || null,
      registrant: cols[7]?.trim() || null,
      backlinksFrom: backlinkParts.length > 0 ? backlinkParts.join(", ") : null,
    });
  }
  return rows;
}

// ---------------------------------------------------------------------------
// CRON_SECRET 인증
// ---------------------------------------------------------------------------
function isCronAuthenticated(request: NextRequest): boolean {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) return false;
  const authHeader = request.headers.get("authorization") ?? "";
  const token = authHeader.replace(/^Bearer\s+/i, "");
  return token === cronSecret;
}

// ---------------------------------------------------------------------------
// POST /api/sync-marketplace — 배치 처리 최적화
// ---------------------------------------------------------------------------
export async function POST(request: NextRequest) {
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

  // 1. Google Sheet CSV 다운로드
  let csvText: string;
  try {
    const res = await fetch(SHEET_CSV_URL, {
      headers: { "User-Agent": "DomainChecker-Sync/1.0" },
      cache: "no-store",
    });
    if (!res.ok) {
      return NextResponse.json({ error: "Google Sheet 다운로드 실패" }, { status: 502 });
    }
    csvText = await res.text();
  } catch {
    return NextResponse.json({ error: "Google Sheet 접근 중 오류" }, { status: 502 });
  }

  // 2. CSV 파싱
  const rows = parseCsv(csvText);
  summary.total = rows.length;
  if (rows.length === 0) {
    return NextResponse.json({ error: "파싱된 행이 없습니다." }, { status: 422 });
  }

  const client = getServiceClient();
  const sheetDomainNames = new Set(rows.map((r) => r.domain));

  // 3. 기존 도메인 일괄 조회 (1회 쿼리)
  const { data: existingDomains } = await client
    .from("domains")
    .select("id, name")
    .in("name", Array.from(sheetDomainNames));

  const domainMap = new Map<string, string>();
  if (existingDomains) {
    for (const d of existingDomains) {
      domainMap.set(d.name, d.id);
    }
  }

  // 4. 새 도메인 일괄 생성 (1회 쿼리)
  const newDomains = rows
    .filter((r) => !domainMap.has(r.domain))
    .map((r) => {
      const parts = r.domain.split(".");
      const tld = parts.length >= 2 ? parts[parts.length - 1] : "";
      return { name: r.domain, tld, status: "active" as const, source: "other" as const };
    });

  if (newDomains.length > 0) {
    // 대량 upsert 시 100개 제한 방지 — 50개씩 청크
    for (let i = 0; i < newDomains.length; i += 50) {
      const batch = newDomains.slice(i, i + 50);
      const { data: created, error: createErr } = await client
        .from("domains")
        .upsert(batch, { onConflict: "name" })
        .select("id, name");

      if (createErr) {
        // 배치 실패 시 개별 insert fallback
        for (const d of batch) {
          const { data: single, error: singleErr } = await client
            .from("domains")
            .upsert(d, { onConflict: "name" })
            .select("id, name")
            .single();
          if (!singleErr && single) {
            domainMap.set(single.name, single.id);
          }
        }
      } else if (created) {
        for (const d of created) {
          domainMap.set(d.name, d.id);
        }
      }
    }

    // upsert 후에도 맵에 없으면 기존 데이터 재조회
    if (domainMap.size < sheetDomainNames.size) {
      const missing = Array.from(sheetDomainNames).filter((n) => !domainMap.has(n));
      if (missing.length > 0) {
        const { data: refetch } = await client
          .from("domains")
          .select("id, name")
          .in("name", missing);
        if (refetch) {
          for (const d of refetch) {
            domainMap.set(d.name, d.id);
          }
        }
      }
    }
  }

  // 5. 기존 csv_import 리스팅 일괄 조회 (1회 쿼리)
  const { data: existingListings } = await client
    .from("marketplace_listings")
    .select("id, domain_id")
    .eq("source", "csv_import");

  const listingByDomainId = new Map<string, string>();
  if (existingListings) {
    for (const l of existingListings) {
      listingByDomainId.set(l.domain_id, l.id);
    }
  }

  // 6. metrics + listings 배치 생성 (10개씩 청크)
  const CHUNK_SIZE = 10;
  for (let i = 0; i < rows.length; i += CHUNK_SIZE) {
    const chunk = rows.slice(i, i + CHUNK_SIZE);

    // 6-1. domain_metrics 배치 upsert
    const metricsPayloads = chunk
      .filter((r) => domainMap.has(r.domain))
      .map((r) => ({
        domain_id: domainMap.get(r.domain)!,
        moz_da: r.da,
        moz_pa: r.pa,
        ahrefs_ref_domains: r.rd,
        updated_at: importBatchId,
      }));

    if (metricsPayloads.length > 0) {
      await client
        .from("domain_metrics")
        .upsert(metricsPayloads, { onConflict: "domain_id" });
    }

    // 6-2. marketplace_listings 배치 처리
    const toInsert: Record<string, unknown>[] = [];
    const toUpdate: { id: string; payload: Record<string, unknown> }[] = [];

    for (const row of chunk) {
      const domainId = domainMap.get(row.domain);
      if (!domainId) {
        summary.skipped++;
        continue;
      }

      const costPrice = row.price ?? 0;
      const askingPrice = Math.round(costPrice * MARGIN_RATE);

      const payload: Record<string, unknown> = {
        domain_id: domainId,
        cost_price_usd: costPrice > 0 ? costPrice : null,
        asking_price: askingPrice > 0 ? askingPrice : null,
        niche: row.niche,
        domain_age_years: row.ageYears,
        registrant: row.registrant,
        backlinks_from: row.backlinksFrom,
        pa: row.pa !== null ? Math.round(row.pa) : null,
        rd: row.rd !== null ? Math.round(row.rd) : null,
        source: "csv_import",
        is_active: true,
        import_batch_id: importBatchId,
        updated_at: importBatchId,
      };

      const existingId = listingByDomainId.get(domainId);
      if (existingId) {
        toUpdate.push({ id: existingId, payload });
      } else {
        toInsert.push({ ...payload, listed_at: importBatchId });
      }
    }

    // 배치 insert
    if (toInsert.length > 0) {
      const { error: insertErr } = await client
        .from("marketplace_listings")
        .insert(toInsert);
      if (insertErr) {
        console.error("Batch listing insert error:", insertErr);
        summary.errors += toInsert.length;
      } else {
        summary.inserted += toInsert.length;
      }
    }

    // update는 개별 처리 (Supabase는 배치 update를 지원하지 않음)
    for (const item of toUpdate) {
      const { error: updateErr } = await client
        .from("marketplace_listings")
        .update(item.payload)
        .eq("id", item.id);
      if (updateErr) {
        summary.errors++;
      } else {
        summary.updated++;
      }
    }
  }

  // 7. 시트에 없는 csv_import 리스팅 비활성화 (1회 쿼리)
  try {
    const { data: activeListings } = await client
      .from("marketplace_listings")
      .select("id, domains!inner(name)")
      .eq("source", "csv_import")
      .eq("is_active", true);

    const toDeactivate: string[] = [];
    if (activeListings) {
      for (const listing of activeListings) {
        const domainsRaw = listing.domains as unknown;
        const domainEntry = Array.isArray(domainsRaw) ? domainsRaw[0] : domainsRaw;
        const domainName = (domainEntry as { name: string } | null)?.name ?? "";
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

  return NextResponse.json({
    ok: summary.errors === 0,
    summary,
    debug: {
      domainMapSize: domainMap.size,
      sheetDomainCount: sheetDomainNames.size,
      newDomainsCount: newDomains.length,
      sampleDomains: Array.from(sheetDomainNames).slice(0, 3),
    },
  });
}
