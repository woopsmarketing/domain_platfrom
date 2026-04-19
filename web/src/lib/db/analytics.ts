import { createServiceClient } from "@/lib/supabase";

/** Shape of the domains join returned by Supabase for sales_history queries */
export interface SaleWithDomain {
  id: string;
  sold_at: string;
  price_usd: number;
  platform: string;
  domains: { id: string; name: string; tld: string; source: string };
}

/** Shape of the sales_history join with domains for TLD stats */
interface SaleWithTld {
  price_usd: number;
  domains: { tld: string };
}

/**
 * 도메인 검색 시 search_count 증가 + last_searched_at 갱신
 */
export async function incrementSearchCount(domainId: string): Promise<void> {
  const client = createServiceClient();
  try {
    await client.rpc("increment_search_count", { domain_id_input: domainId });
  } catch {
    // RPC가 없으면 last_searched_at만 업데이트
    await client
      .from("domains")
      .update({ last_searched_at: new Date().toISOString() })
      .eq("id", domainId);
  }
}

/**
 * 최근 검색된 도메인 목록 (A2)
 */
export async function getRecentlySearched(limit = 10) {
  const client = createServiceClient();
  const { data, error } = await client
    .from("domains")
    .select("id, name, tld, status, source, last_searched_at, domain_metrics!left(moz_da, ahrefs_dr, majestic_tf)")
    .not("last_searched_at", "is", null)
    .order("last_searched_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  return data ?? [];
}

/**
 * 인기 검색 도메인 TOP N (D1)
 */
export async function getPopularDomains(limit = 10) {
  const client = createServiceClient();
  const { data, error } = await client
    .from("domains")
    .select("id, name, tld, status, source, search_count, domain_metrics!left(moz_da, ahrefs_dr, majestic_tf)")
    .gt("search_count", 0)
    .order("search_count", { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  return data ?? [];
}

/**
 * 낙찰 하이라이트 (D2) — 최근 고가 낙찰 도메인
 *
 * sold_auctions 테이블에서 조회 (실제 데이터 보유)
 * fallback 전략: 7일 → 30일 → 90일 → 전체 (데이터가 없으면 범위 확장)
 */
export interface SoldAuctionHighlight {
  id: string;
  domain: string;
  tld: string;
  price_usd: number;
  bid_count: number | null;
  sold_at: string;
  platform: string;
}

export async function getTodayHighlights(limit = 5): Promise<SoldAuctionHighlight[]> {
  const client = createServiceClient();

  const ranges = [7, 30, 90, 365, 0]; // 0 = 전체

  for (const days of ranges) {
    let query = client
      .from("sold_auctions")
      .select("id, domain, tld, price_usd, bid_count, sold_at, platform")
      .gt("price_usd", 0)
      .order("price_usd", { ascending: false })
      .limit(limit);

    if (days > 0) {
      const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
      query = query.gte("sold_at", since);
    }

    const { data, error } = await query;
    if (error) throw new Error(error.message);

    if (data && data.length > 0) {
      return data;
    }
  }

  return [];
}

/**
 * TLD별 통계 (C3)
 */
export async function getTldStats() {
  const client = createServiceClient();

  // 전체 도메인 수 by TLD
  const { data: tldCounts, error: countError } = await client
    .from("domains")
    .select("tld")
    .eq("status", "sold");

  if (countError) throw new Error(countError.message);

  // 낙찰 이력에서 TLD별 평균가, 최고가, 거래 수
  const { data: salesData, error: salesError } = await client
    .from("sales_history")
    .select("price_usd, domains!inner(tld)");

  if (salesError) throw new Error(salesError.message);

  // 집계
  const statsMap = new Map<string, { count: number; totalPrice: number; maxPrice: number; salesCount: number }>();

  for (const row of tldCounts ?? []) {
    const tld = row.tld;
    if (!statsMap.has(tld)) {
      statsMap.set(tld, { count: 0, totalPrice: 0, maxPrice: 0, salesCount: 0 });
    }
    statsMap.get(tld)!.count++;
  }

  const salesRows = (salesData ?? []) as unknown as SaleWithTld[];
  for (const row of salesRows) {
    const tld = row.domains.tld;
    if (!statsMap.has(tld)) {
      statsMap.set(tld, { count: 0, totalPrice: 0, maxPrice: 0, salesCount: 0 });
    }
    const stat = statsMap.get(tld)!;
    stat.salesCount++;
    stat.totalPrice += row.price_usd;
    stat.maxPrice = Math.max(stat.maxPrice, row.price_usd);
  }

  return Array.from(statsMap.entries())
    .map(([tld, stat]) => ({
      tld: "." + tld,
      domainCount: stat.count,
      salesCount: stat.salesCount,
      avgPrice: stat.salesCount > 0 ? Math.round(stat.totalPrice / stat.salesCount) : 0,
      maxPrice: stat.maxPrice,
    }))
    .sort((a, b) => b.salesCount - a.salesCount);
}

/**
 * 마켓플레이스 활성 리스팅 (홈 프리미엄 도메인 섹션용)
 */
export interface MarketplaceListingHome {
  domain_name: string;
  asking_price: number;
  listed_at: string;
  moz_da: number | null;
  ahrefs_dr: number | null;
}

export async function getActiveMarketplaceListings(limit = 50): Promise<MarketplaceListingHome[]> {
  const client = createServiceClient();

  // Step 1: marketplace_listings + domains (domain_metrics has no direct FK)
  const { data, error } = await client
    .from("marketplace_listings")
    .select("domain_id, asking_price, listed_at, domains!inner(name)")
    .eq("is_active", true)
    .order("asking_price", { ascending: false })
    .limit(limit);

  if (error || !data || data.length === 0) return [];

  type ListingRow = {
    domain_id: string;
    asking_price: number;
    listed_at: string;
    domains: { name: string } | { name: string }[] | null;
  };

  // Step 2: domain_metrics bulk fetch
  const typedData = data as unknown as ListingRow[];
  const domainIds = typedData.map((r) => r.domain_id).filter(Boolean);
  const metricsMap: Record<string, { moz_da: number | null; ahrefs_dr: number | null }> = {};

  if (domainIds.length > 0) {
    const { data: metricsRows } = await client
      .from("domain_metrics")
      .select("domain_id, moz_da, ahrefs_dr")
      .in("domain_id", domainIds);
    if (metricsRows) {
      for (const m of metricsRows) {
        metricsMap[m.domain_id] = { moz_da: m.moz_da ?? null, ahrefs_dr: m.ahrefs_dr ?? null };
      }
    }
  }

  return typedData.map((row) => {
    const domainName = Array.isArray(row.domains) ? row.domains[0]?.name : row.domains?.name;
    const metrics = metricsMap[row.domain_id];
    return {
      domain_name: domainName ?? "",
      asking_price: row.asking_price,
      listed_at: row.listed_at,
      moz_da: metrics?.moz_da ?? null,
      ahrefs_dr: metrics?.ahrefs_dr ?? null,
    };
  });
}
