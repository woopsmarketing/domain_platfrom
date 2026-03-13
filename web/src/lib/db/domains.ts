import { createServiceClient } from "@/lib/supabase";
import type { DomainListItem, DomainDetail, DomainStatus, DomainSource } from "@/types/domain";

const ALLOWED_SOURCES: DomainSource[] = ["godaddy", "namecheap", "dynadot"];

export async function getDomains(params: {
  tab?: "auction" | "expired" | "premium";
  source?: string;
  page?: number;
  limit?: number;
}): Promise<{ data: DomainListItem[]; total: number }> {
  const client = createServiceClient();
  const { tab = "auction", source = "all", page = 1, limit = 50 } = params;
  const offset = (page - 1) * limit;

  // Whitelist source to prevent injection
  const safeSource = source !== "all" && ALLOWED_SOURCES.includes(source as DomainSource) ? source : "all";

  let query = client
    .from("domains")
    .select(
      `
      id, name, tld, status, source, registrar, expires_at, created_at,
      auction_listings!left(current_price_usd, auction_end_at, platform),
      domain_metrics!left(moz_da, ahrefs_dr, majestic_tf, ahrefs_traffic)
    `,
      { count: "exact" }
    )
    .range(offset, offset + limit - 1)
    .order("created_at", { ascending: false });

  if (tab === "auction") query = query.eq("status", "auction");
  else if (tab === "expired") query = query.eq("status", "expired");
  else if (tab === "premium") query = query.eq("status", "active");

  if (safeSource !== "all") query = query.eq("source", safeSource);

  const { data, error, count } = await query;
  if (error) throw new Error(error.message);

  const domains: DomainListItem[] = (data ?? []).map((row: Record<string, unknown>) => {
    const auctionListing = Array.isArray(row.auction_listings) ? row.auction_listings[0] : null;
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
      currentPrice: auctionListing?.current_price_usd ?? undefined,
      auctionEndAt: auctionListing?.auction_end_at ?? undefined,
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
    client.from("domain_metrics").select("domain_id, moz_da, moz_spam, ahrefs_dr, ahrefs_traffic, ahrefs_backlinks, ahrefs_traffic_value, majestic_tf, majestic_cf, updated_at").eq("domain_id", domain.id).single(),
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
          mozSpam: metricsResult.data.moz_spam,
          ahrefsDR: metricsResult.data.ahrefs_dr,
          ahrefsTraffic: metricsResult.data.ahrefs_traffic,
          ahrefsBacklinks: metricsResult.data.ahrefs_backlinks,
          ahrefsTrafficValue: metricsResult.data.ahrefs_traffic_value,
          majesticTF: metricsResult.data.majestic_tf,
          majesticCF: metricsResult.data.majestic_cf,
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
