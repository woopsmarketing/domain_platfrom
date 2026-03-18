import { createServerClient } from "@/lib/supabase";
import type { DomainMetrics } from "@/types/domain";

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
  }
}
