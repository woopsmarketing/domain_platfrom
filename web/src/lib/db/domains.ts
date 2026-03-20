import { createServiceClient } from "@/lib/supabase";
import type { DomainListItem, DomainDetail, DomainStatus, DomainSource } from "@/types/domain";

const ALLOWED_SOURCES: DomainSource[] = ["godaddy", "namecheap", "dynadot"];

/**
 * DB에 도메인이 없으면 자동 생성하고 ID를 반환.
 * 이미 있으면 기존 ID 반환.
 */
export async function ensureDomainInDb(domainName: string): Promise<string> {
  const client = createServiceClient();

  const { data: existing } = await client
    .from("domains")
    .select("id")
    .eq("name", domainName)
    .single();

  if (existing) return existing.id;

  const parts = domainName.split(".");
  const tld = parts.length >= 2 ? parts[parts.length - 1] : "";

  const { data: created, error } = await client
    .from("domains")
    .insert({
      name: domainName,
      tld,
      status: "active",
      source: "other",
    })
    .select("id")
    .single();

  if (error) throw new Error(`도메인 생성 실패: ${error.message}`);
  return created.id;
}

export async function getDomains(params: {
  tab?: "recent" | "highvalue" | "all";
  source?: string;
  page?: number;
  limit?: number;
}): Promise<{ data: DomainListItem[]; total: number }> {
  const client = createServiceClient();
  const { tab = "recent", source = "all", page = 1, limit = 50 } = params;
  const offset = (page - 1) * limit;

  // Whitelist source to prevent injection
  const safeSource = source !== "all" && ALLOWED_SOURCES.includes(source as DomainSource) ? source : "all";

  let query = client
    .from("domains")
    .select(
      `
      id, name, tld, status, source, registrar, expires_at, created_at,
      sales_history!left(price_usd, sold_at, platform),
      domain_metrics!left(moz_da, ahrefs_dr, majestic_tf, ahrefs_traffic)
    `,
      { count: "exact" }
    )
    .range(offset, offset + limit - 1);

  if (tab === "recent") {
    query = query.eq("status", "sold").order("created_at", { ascending: false });
  } else if (tab === "highvalue") {
    query = query.eq("status", "sold").order("created_at", { ascending: false });
    // High-value filtering will be done client-side from sales_history price
  } else {
    query = query.eq("status", "sold").order("created_at", { ascending: false });
  }

  if (safeSource !== "all") query = query.eq("source", safeSource);

  const { data, error, count } = await query;
  if (error) throw new Error(error.message);

  let domains: DomainListItem[] = (data ?? []).map((row: Record<string, unknown>) => {
    const salesArr = Array.isArray(row.sales_history) ? row.sales_history : [];
    const latestSale = salesArr[0] ?? null;
    const metrics = Array.isArray(row.domain_metrics) ? row.domain_metrics[0] : null;
    return {
      id: row.id as string,
      name: row.name as string,
      tld: row.tld as string,
      status: row.status as DomainStatus,
      source: row.source as DomainSource,
      registrar: row.registrar as string | undefined,
      expiresAt: row.expires_at as string | undefined,
      createdAt: row.created_at as string,
      soldPrice: latestSale?.price_usd ?? undefined,
      soldAt: latestSale?.sold_at ?? undefined,
      metrics: metrics
        ? {
            mozDA: metrics.moz_da,
            ahrefsDR: metrics.ahrefs_dr,
            majesticTF: metrics.majestic_tf,
            ahrefsTraffic: metrics.ahrefs_traffic,
          }
        : undefined,
    };
  });

  // High-value tab: filter to domains with price >= $500
  if (tab === "highvalue") {
    domains = domains.filter((d) => d.soldPrice && d.soldPrice >= 500);
  }

  return { data: domains, total: count ?? 0 };
}

export async function getDomainByName(name: string): Promise<DomainDetail | null> {
  const client = createServiceClient();

  const { data: domain, error } = await client
    .from("domains")
    .select("id, name, tld, status, source, registrar, expires_at, created_at")
    .eq("name", name)
    .single();

  if (error || !domain) return null;

  const [metricsResult, salesResult, waybackResult] = await Promise.all([
    client.from("domain_metrics").select("domain_id, moz_da, moz_pa, moz_links, moz_spam, majestic_tf, majestic_cf, majestic_links, majestic_ref_domains, majestic_ttf0_name, ahrefs_dr, ahrefs_backlinks, ahrefs_ref_domains, ahrefs_traffic, ahrefs_traffic_value, ahrefs_organic_keywords, updated_at").eq("domain_id", domain.id).single(),
    client.from("sales_history").select("id, domain_id, sold_at, price_usd, platform").eq("domain_id", domain.id).order("sold_at", { ascending: false }),
    client.from("wayback_summary").select("domain_id, first_snapshot_at, last_snapshot_at, total_snapshots").eq("domain_id", domain.id).single(),
  ]);

  return {
    domain: {
      id: domain.id,
      name: domain.name,
      tld: domain.tld,
      status: domain.status as DomainStatus,
      source: domain.source as DomainSource,
      registrar: domain.registrar ?? undefined,
      expiresAt: domain.expires_at ?? undefined,
      createdAt: domain.created_at,
    },
    metrics: metricsResult.data
      ? {
          domainId: metricsResult.data.domain_id,
          mozDA: metricsResult.data.moz_da,
          mozPA: metricsResult.data.moz_pa,
          mozLinks: metricsResult.data.moz_links,
          mozSpam: metricsResult.data.moz_spam,
          majesticTF: metricsResult.data.majestic_tf,
          majesticCF: metricsResult.data.majestic_cf,
          majesticLinks: metricsResult.data.majestic_links,
          majesticRefDomains: metricsResult.data.majestic_ref_domains,
          majesticTTF0Name: metricsResult.data.majestic_ttf0_name,
          ahrefsDR: metricsResult.data.ahrefs_dr,
          ahrefsBacklinks: metricsResult.data.ahrefs_backlinks,
          ahrefsRefDomains: metricsResult.data.ahrefs_ref_domains,
          ahrefsTraffic: metricsResult.data.ahrefs_traffic,
          ahrefsTrafficValue: metricsResult.data.ahrefs_traffic_value,
          ahrefsOrganicKeywords: metricsResult.data.ahrefs_organic_keywords,
          updatedAt: metricsResult.data.updated_at,
        }
      : null,
    salesHistory: (salesResult.data ?? []).map((s) => ({
      id: s.id,
      domainId: s.domain_id,
      soldAt: s.sold_at,
      priceUsd: s.price_usd,
      platform: s.platform,
    })),
    wayback: waybackResult.data
      ? {
          domainId: waybackResult.data.domain_id,
          firstSnapshotAt: waybackResult.data.first_snapshot_at,
          lastSnapshotAt: waybackResult.data.last_snapshot_at,
          totalSnapshots: waybackResult.data.total_snapshots,
        }
      : null,
    whois: null, // Fetched separately via WhoisXML API
  };
}
