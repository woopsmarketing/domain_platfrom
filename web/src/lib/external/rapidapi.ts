import { createServerClient } from "@/lib/supabase";
import type { DomainMetrics } from "@/types/domain";

// 동일 도메인 동시 중복 호출 방지 (Vercel 병렬 인스턴스 대응)
// 같은 인스턴스에서 동시에 같은 도메인 요청이 들어오면 1번만 API 호출
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

export async function fetchDomainMetrics(
  domainId: string,
  domainName: string
): Promise<DomainMetrics | null> {
  const apiKey = process.env.RAPIDAPI_KEY;
  if (!apiKey) {
    console.error("RAPIDAPI_KEY is not set");
    return null;
  }

  // 같은 도메인이 이미 호출 중이면 스킵 (중복 과금 방지)
  if (inProgress.has(domainName)) {
    console.log(`[RapidAPI] ${domainName} already in progress, skipping`);
    return null;
  }
  inProgress.add(domainName);

  try {
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

    // DB upsert
    const client = createServerClient();
    await client.from("domain_metrics").upsert(
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

    return metrics;
  } catch (err) {
    console.error("fetchDomainMetrics failed:", err);
    return null;
  } finally {
    inProgress.delete(domainName);
  }
}
