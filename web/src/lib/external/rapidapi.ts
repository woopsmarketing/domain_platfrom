import { createServiceClient } from "@/lib/supabase";
import type { DomainMetrics } from "@/types/domain";
import { CACHE_TTL_MS } from "@/lib/cache";
import {
  getCachedMetrics,
  saveMetricsToCache,
} from "@/lib/external/backlinkshop-cache";

// 동일 도메인 동시 중복 호출 방지 (Vercel 병렬 인스턴스 대응)
const inProgress = new Set<string>();

interface RapidApiResponse {
  status?: string;
  // Moz
  mozDA?: number | string;
  mozPA?: number | string;
  mozLinks?: number | string;
  mozSpam?: number | string;
  // Majestic
  majesticTF?: number | string;
  majesticCF?: number | string;
  majesticLinks?: number | string;
  majesticRefDomains?: number | string;
  majesticTTF0Name?: string;
  // Ahrefs
  ahrefsDR?: number | string;
  ahrefsBacklinks?: number | string;
  ahrefsRefDomains?: number | string;
  ahrefsTraffic?: number | string;
  ahrefsTrafficValue?: number | string;
  ahrefsOrganicKeywords?: number | string;
}

function toNum(v: number | string | undefined | null): number | null {
  if (v == null) return null;
  const n = typeof v === "string" ? parseFloat(v) : v;
  return isNaN(n) ? null : n;
}

interface DbMetricsRow {
  domain_id: string;
  moz_da: number | null;
  moz_pa: number | null;
  moz_links: number | null;
  moz_spam: number | null;
  majestic_tf: number | null;
  majestic_cf: number | null;
  majestic_links: number | null;
  majestic_ref_domains: number | null;
  majestic_ttf0_name: string | null;
  ahrefs_dr: number | null;
  ahrefs_backlinks: number | null;
  ahrefs_ref_domains: number | null;
  ahrefs_traffic: number | null;
  ahrefs_traffic_value: number | null;
  ahrefs_organic_keywords: number | null;
  updated_at: string | null;
}

function rowToMetrics(row: DbMetricsRow, domainId: string): DomainMetrics {
  return {
    domainId,
    mozDA: row.moz_da,
    mozPA: row.moz_pa,
    mozLinks: row.moz_links,
    mozSpam: row.moz_spam,
    majesticTF: row.majestic_tf,
    majesticCF: row.majestic_cf,
    majesticLinks: row.majestic_links,
    majesticRefDomains: row.majestic_ref_domains,
    majesticTTF0Name: row.majestic_ttf0_name,
    ahrefsDR: row.ahrefs_dr,
    ahrefsBacklinks: row.ahrefs_backlinks,
    ahrefsRefDomains: row.ahrefs_ref_domains,
    ahrefsTraffic: row.ahrefs_traffic,
    ahrefsTrafficValue: row.ahrefs_traffic_value,
    ahrefsOrganicKeywords: row.ahrefs_organic_keywords,
    updatedAt: row.updated_at ?? new Date().toISOString(),
  };
}

const METRICS_COLUMNS =
  "domain_id, moz_da, moz_pa, moz_links, moz_spam, majestic_tf, majestic_cf, majestic_links, majestic_ref_domains, majestic_ttf0_name, ahrefs_dr, ahrefs_backlinks, ahrefs_ref_domains, ahrefs_traffic, ahrefs_traffic_value, ahrefs_organic_keywords, updated_at";

export async function fetchDomainMetrics(
  domainId: string,
  domainName: string
): Promise<DomainMetrics | null> {
  // service role client — RLS 우회 (DB 저장 보장)
  const client = createServiceClient();

  // ─────────────────────────────────────────────
  // [GUARD 0] DB 14일 캐시 — 최우선 가드
  // 호출 측이 가드를 누락하더라도 함수 진입 즉시 DB 캐시 확인.
  // 14일 이내면 RapidAPI / 외부 캐시 절대 호출하지 않음.
  // ─────────────────────────────────────────────
  try {
    const { data: existing } = await client
      .from("domain_metrics")
      .select(METRICS_COLUMNS)
      .eq("domain_id", domainId)
      .maybeSingle();

    if (existing?.updated_at) {
      const ageMs = Date.now() - new Date(existing.updated_at).getTime();
      if (!isNaN(ageMs) && ageMs >= 0 && ageMs < CACHE_TTL_MS) {
        // 14일 이내 → DB 데이터 그대로 반환 (RapidAPI 호출 0건)
        console.log(
          `[RapidAPI] DB cache hit for ${domainName} (age=${Math.round(ageMs / 86400000)}d)`
        );
        return rowToMetrics(existing as DbMetricsRow, domainId);
      }
    }
  } catch (err) {
    // DB 조회 실패 시에도 다음 단계로 진행
    console.warn(`[RapidAPI] DB cache check failed for ${domainName}:`, err);
  }

  // ─────────────────────────────────────────────
  // [GUARD 1] 동시 중복 호출 방지 (인스턴스 내)
  // ─────────────────────────────────────────────
  if (inProgress.has(domainName)) {
    console.log(`[RapidAPI] ${domainName} already in progress, skipping`);
    return null;
  }
  inProgress.add(domainName);

  try {
    const apiKey = process.env.RAPIDAPI_KEY;
    if (!apiKey) {
      console.error("RAPIDAPI_KEY is not set");
      return null;
    }

    // ─────────────────────────────────────────────
    // [STEP 1] 백링크샵 공유 캐시 조회 (외부 협업 캐시)
    // ─────────────────────────────────────────────
    const cached = await getCachedMetrics(domainName);
    if (cached?.data) {
      console.log(
        `[RapidAPI] backlinkshop cache hit for ${domainName} (source: ${cached.source})`
      );
      const d = cached.data;
      const num = (v: number | null | undefined): number | null =>
        v == null ? null : isNaN(v) ? null : v;

      // 우리 DB의 updated_at은 항상 현재 시각으로 — 백링크샵 fetched_at이 오래된
      // 값이라도 우리 14일 캐시 카운터는 새로 시작 (무한 stale 루프 방지)
      const nowIso = new Date().toISOString();
      const metrics: DomainMetrics = {
        domainId,
        mozDA: num(d.mozDA),
        mozPA: num(d.mozPA),
        mozLinks: num(d.mozLinks),
        mozSpam: num(d.mozSpam),
        majesticTF: num(d.majesticTF),
        majesticCF: num(d.majesticCF),
        majesticLinks: num(d.majesticLinks),
        majesticRefDomains: num(d.majesticRefDomains),
        majesticTTF0Name: d.majesticTTF0Name ?? null,
        ahrefsDR: num(d.ahrefsDR),
        ahrefsBacklinks: num(d.ahrefsBacklinks),
        ahrefsRefDomains: num(d.ahrefsRefDomains),
        ahrefsTraffic: num(d.ahrefsTraffic),
        ahrefsTrafficValue: num(d.ahrefsTrafficValue),
        ahrefsOrganicKeywords: num(d.ahrefsOrganicKeywords),
        updatedAt: nowIso,
      };

      const { error: upsertErr } = await client.from("domain_metrics").upsert(
        {
          domain_id: domainId,
          moz_da: metrics.mozDA,
          moz_pa: metrics.mozPA,
          moz_links: metrics.mozLinks,
          moz_spam: metrics.mozSpam,
          majestic_tf: metrics.majesticTF,
          majestic_cf: metrics.majesticCF,
          majestic_links: metrics.majesticLinks,
          majestic_ref_domains: metrics.majesticRefDomains,
          majestic_ttf0_name: metrics.majesticTTF0Name,
          ahrefs_dr: metrics.ahrefsDR,
          ahrefs_backlinks: metrics.ahrefsBacklinks,
          ahrefs_ref_domains: metrics.ahrefsRefDomains,
          ahrefs_traffic: metrics.ahrefsTraffic,
          ahrefs_traffic_value: metrics.ahrefsTrafficValue,
          ahrefs_organic_keywords: metrics.ahrefsOrganicKeywords,
          updated_at: metrics.updatedAt,
        },
        { onConflict: "domain_id" }
      );

      if (upsertErr) {
        console.error(
          `[RapidAPI] DB upsert failed for ${domainName}:`,
          upsertErr.message
        );
      }

      return metrics;
    }

    // ─────────────────────────────────────────────
    // [STEP 2] RapidAPI 직접 호출 (마지막 수단)
    // ─────────────────────────────────────────────
    console.log(`[RapidAPI] calling external API for ${domainName}`);
    const res = await fetch(
      `https://domain-metrics-check.p.rapidapi.com/domain-metrics/${encodeURIComponent(domainName)}/`,
      {
        headers: {
          "Content-Type": "application/json",
          "x-rapidapi-key": apiKey,
          "x-rapidapi-host": "domain-metrics-check.p.rapidapi.com",
        },
        next: { revalidate: 0 },
      }
    );

    if (!res.ok) {
      console.error(`RapidAPI error: ${res.status} ${res.statusText}`);
      return null;
    }

    const raw: RapidApiResponse = await res.json();

    if (raw.status === "error") {
      console.error("RapidAPI returned error:", raw);
      return null;
    }

    const metrics: DomainMetrics = {
      domainId,
      mozDA: toNum(raw.mozDA),
      mozPA: toNum(raw.mozPA),
      mozLinks: toNum(raw.mozLinks),
      mozSpam: toNum(raw.mozSpam),
      majesticTF: toNum(raw.majesticTF),
      majesticCF: toNum(raw.majesticCF),
      majesticLinks: toNum(raw.majesticLinks),
      majesticRefDomains: toNum(raw.majesticRefDomains),
      majesticTTF0Name: raw.majesticTTF0Name || null,
      ahrefsDR: toNum(raw.ahrefsDR),
      ahrefsBacklinks: toNum(raw.ahrefsBacklinks),
      ahrefsRefDomains: toNum(raw.ahrefsRefDomains),
      ahrefsTraffic: toNum(raw.ahrefsTraffic),
      ahrefsTrafficValue: toNum(raw.ahrefsTrafficValue),
      ahrefsOrganicKeywords: toNum(raw.ahrefsOrganicKeywords),
      updatedAt: new Date().toISOString(),
    };

    const { error: upsertErr } = await client.from("domain_metrics").upsert(
      {
        domain_id: domainId,
        moz_da: metrics.mozDA,
        moz_pa: metrics.mozPA,
        moz_links: metrics.mozLinks,
        moz_spam: metrics.mozSpam,
        majestic_tf: metrics.majesticTF,
        majestic_cf: metrics.majesticCF,
        majestic_links: metrics.majesticLinks,
        majestic_ref_domains: metrics.majesticRefDomains,
        majestic_ttf0_name: metrics.majesticTTF0Name,
        ahrefs_dr: metrics.ahrefsDR,
        ahrefs_backlinks: metrics.ahrefsBacklinks,
        ahrefs_ref_domains: metrics.ahrefsRefDomains,
        ahrefs_traffic: metrics.ahrefsTraffic,
        ahrefs_traffic_value: metrics.ahrefsTrafficValue,
        ahrefs_organic_keywords: metrics.ahrefsOrganicKeywords,
        updated_at: metrics.updatedAt,
      },
      { onConflict: "domain_id" }
    );

    if (upsertErr) {
      console.error(
        `[RapidAPI] DB upsert failed for ${domainName}:`,
        upsertErr.message
      );
    }

    // 백링크샵 공유 캐시에도 기록 (fire-and-forget)
    saveMetricsToCache(domainName, {
      mozDA: metrics.mozDA,
      mozPA: metrics.mozPA,
      mozLinks: metrics.mozLinks,
      mozSpam: metrics.mozSpam,
      majesticTF: metrics.majesticTF,
      majesticCF: metrics.majesticCF,
      majesticLinks: metrics.majesticLinks,
      majesticRefDomains: metrics.majesticRefDomains,
      majesticTTF0Name: metrics.majesticTTF0Name,
      ahrefsDR: metrics.ahrefsDR,
      ahrefsBacklinks: metrics.ahrefsBacklinks,
      ahrefsRefDomains: metrics.ahrefsRefDomains,
      ahrefsTraffic: metrics.ahrefsTraffic,
      ahrefsTrafficValue: metrics.ahrefsTrafficValue,
      ahrefsOrganicKeywords: metrics.ahrefsOrganicKeywords,
    }).catch(() => {});

    return metrics;
  } catch (err) {
    console.error("fetchDomainMetrics failed:", err);
    return null;
  } finally {
    inProgress.delete(domainName);
  }
}
