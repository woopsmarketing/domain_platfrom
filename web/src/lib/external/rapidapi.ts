import { createServerClient } from "@/lib/supabase";
import type { DomainMetrics } from "@/types/domain";

interface RapidApiResponse {
  mozDA?: number;
  ahrefsDR?: number;
  majesticTF?: number;
  majesticCF?: number;
  ahrefsTraffic?: number;
  ahrefsBacklinks?: number;
  ahrefsTrafficValue?: number;
  mozSpam?: number;
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
      `https://domain-metrics-check.p.rapidapi.com/domain-metrics/${encodeURIComponent(domainName)}`,
      {
        headers: {
          "X-RapidAPI-Key": apiKey,
          "X-RapidAPI-Host": "domain-metrics-check.p.rapidapi.com",
        },
        next: { revalidate: 0 },
      }
    );

    if (!res.ok) {
      console.error(`RapidAPI error: ${res.status} ${res.statusText}`);
      return null;
    }

    const raw: RapidApiResponse = await res.json();

    const metrics: DomainMetrics = {
      domainId,
      mozDA: raw.mozDA ?? null,
      mozSpam: raw.mozSpam ?? null,
      ahrefsDR: raw.ahrefsDR ?? null,
      ahrefsTraffic: raw.ahrefsTraffic ?? null,
      ahrefsBacklinks: raw.ahrefsBacklinks ?? null,
      ahrefsTrafficValue: raw.ahrefsTrafficValue ?? null,
      majesticTF: raw.majesticTF ?? null,
      majesticCF: raw.majesticCF ?? null,
      updatedAt: new Date().toISOString(),
    };

    // DB upsert
    const client = createServerClient();
    await client.from("domain_metrics").upsert(
      {
        domain_id: domainId,
        moz_da: metrics.mozDA,
        moz_spam: metrics.mozSpam,
        ahrefs_dr: metrics.ahrefsDR,
        ahrefs_traffic: metrics.ahrefsTraffic,
        ahrefs_backlinks: metrics.ahrefsBacklinks,
        ahrefs_traffic_value: metrics.ahrefsTrafficValue,
        majestic_tf: metrics.majesticTF,
        majestic_cf: metrics.majesticCF,
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
