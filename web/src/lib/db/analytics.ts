import { createServiceClient } from "@/lib/supabase";

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
 * 오늘의 낙찰 하이라이트 (D2) — 최근 고가 낙찰 도메인
 */
export async function getTodayHighlights(limit = 5) {
  const client = createServiceClient();
  const today = new Date().toISOString().split("T")[0];

  // 오늘 데이터가 없을 수 있으므로 최근 7일 이내에서 고가순
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

  const { data, error } = await client
    .from("sales_history")
    .select("id, sold_at, price_usd, platform, domains!inner(id, name, tld, source)")
    .gte("sold_at", sevenDaysAgo)
    .order("price_usd", { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  return data ?? [];
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

  for (const row of salesData ?? []) {
    const tld = (row.domains as unknown as { tld: string }).tld;
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
      tld: `.${tld}`,
      domainCount: stat.count,
      salesCount: stat.salesCount,
      avgPrice: stat.salesCount > 0 ? Math.round(stat.totalPrice / stat.salesCount) : 0,
      maxPrice: stat.maxPrice,
    }))
    .sort((a, b) => b.salesCount - a.salesCount);
}
