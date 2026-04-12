import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createServiceClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const GRAPHQL_URL = "https://aftermarketapi.namecheap.com/client/graphql";
const GRAPHQL_HASH =
  "fe84e690294ebd46f5cbc0a2b3fe1fe7fc606395c28f54afab18ff6521d98110";

const HEADERS = {
  "Content-Type": "application/json",
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
  Origin: "https://www.namecheap.com",
  Referer: "https://www.namecheap.com/",
};

const MIN_BIDS = 2;
const MAX_HOURS = 24;
const PAGE_SIZE = 100;
const MAX_PAGES = 50;

interface AuctionItem {
  domain: string;
  tld: string;
  current_price: number;
  bid_count: number;
  end_time_raw: string;
}

interface ActiveAuctionRow {
  domain: string;
  tld: string;
  current_price: number;
  bid_count: number | null;
  end_time_raw: string | null;
}

function isAuthorized(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  // If no secret is configured, allow all requests for backward compatibility
  if (!secret) return true;

  // Check Authorization: Bearer <secret> header
  const authHeader = request.headers.get("authorization");
  if (authHeader === `Bearer ${secret}`) return true;

  // Check ?secret=<secret> query param
  const querySecret = request.nextUrl.searchParams.get("secret");
  if (querySecret === secret) return true;

  return false;
}

async function fetchPage(
  page: number
): Promise<{ items: Record<string, unknown>[]; total: number }> {
  const payload = {
    operationName: "SaleTable",
    variables: {
      filter: {},
      sort: [{ column: "bidCount", direction: "desc" }],
      page,
      pageSize: PAGE_SIZE,
    },
    extensions: {
      persistedQuery: { version: 1, sha256Hash: GRAPHQL_HASH },
    },
  };

  const resp = await fetch(GRAPHQL_URL, {
    method: "POST",
    headers: HEADERS,
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  if (!resp.ok) return { items: [], total: 0 };

  const data = await resp.json();
  const sales = data?.data?.sales ?? {};
  return { items: sales.items ?? [], total: sales.total ?? 0 };
}

function isWithinDeadline(endDateStr: string): boolean {
  const end = new Date(endDateStr).getTime();
  if (isNaN(end)) return false;
  const diffHours = (end - Date.now()) / (1000 * 60 * 60);
  return diffHours > 0 && diffHours <= MAX_HOURS;
}

function parseAuctionItems(
  items: Record<string, unknown>[]
): { results: AuctionItem[]; hitBidFloor: boolean } {
  const results: AuctionItem[] = [];
  let hitBidFloor = false;

  for (const item of items) {
    const bidCount = Number(item.bidCount ?? 0);

    if (bidCount < MIN_BIDS) {
      hitBidFloor = true;
      break;
    }

    const endDate = (item.endDate as string) ?? "";
    if (!isWithinDeadline(endDate)) continue;

    const product = item.product as Record<string, string> | null;
    const domain = (product?.name ?? "").toLowerCase().trim();
    if (!domain || !domain.includes(".")) continue;

    const parts = domain.split(".");
    const tld = parts[parts.length - 1];

    results.push({
      domain,
      tld,
      current_price: Math.round(Number(item.price ?? 0)),
      bid_count: bidCount,
      end_time_raw: endDate,
    });
  }

  return { results, hitBidFloor };
}

async function fetchAllAuctions(): Promise<AuctionItem[]> {
  // Fetch page 1 first to determine total and check for bid floor
  const { items: firstPageItems, total } = await fetchPage(1);
  if (!firstPageItems || firstPageItems.length === 0) return [];

  const { results: firstPageResults, hitBidFloor } =
    parseAuctionItems(firstPageItems);

  // If we already hit the bid floor on page 1, no need to fetch more
  if (hitBidFloor || total <= PAGE_SIZE) {
    return firstPageResults;
  }

  // Calculate remaining pages needed (cap at MAX_PAGES)
  const totalPages = Math.min(Math.ceil(total / PAGE_SIZE), MAX_PAGES);
  const remainingPages = Array.from(
    { length: totalPages - 1 },
    (_, i) => i + 2
  );

  // Fetch all remaining pages in parallel
  const pageResults = await Promise.all(remainingPages.map(fetchPage));

  const allResults = [...firstPageResults];

  for (const { items } of pageResults) {
    if (!items || items.length === 0) break;
    const { results, hitBidFloor: pageHitFloor } = parseAuctionItems(items);
    allResults.push(...results);
    if (pageHitFloor) break;
  }

  return allResults;
}

async function detectAndSaveSold(
  currentItems: AuctionItem[]
): Promise<number> {
  const client = createServiceClient();

  // Single query — fetch all fields needed for both diff and upsert
  const { data: prevRows } = await client
    .from("active_auctions")
    .select("domain, tld, current_price, bid_count, end_time_raw");

  const currentDomains = new Set(currentItems.map((i) => i.domain));
  const soldItems: ActiveAuctionRow[] = [];

  for (const row of (prevRows ?? []) as ActiveAuctionRow[]) {
    // Still in active list — not sold
    if (currentDomains.has(row.domain)) continue;

    // No end time or can't parse — skip
    const endTime = new Date(row.end_time_raw ?? "").getTime();
    if (isNaN(endTime)) continue;

    // End time is still in the future — not sold yet, just filtered out
    if (endTime > Date.now()) continue;

    soldItems.push(row);
  }

  if (soldItems.length > 0) {
    const soldRows = soldItems.map((item) => ({
      domain: item.domain,
      tld: item.tld,
      price_usd: item.current_price,
      bid_count: item.bid_count,
      sold_at: new Date().toISOString(),
      platform: "namecheap",
    }));

    await client
      .from("sold_auctions")
      .upsert(soldRows, { onConflict: "domain,platform", ignoreDuplicates: true });

    revalidatePath("/market-history");
  }

  // Replace active_auctions snapshot atomically
  await client.from("active_auctions").delete().neq("domain", "");

  if (currentItems.length > 0) {
    const activeRows = currentItems.map((item) => ({
      domain: item.domain,
      tld: item.tld,
      current_price: item.current_price,
      bid_count: item.bid_count,
      end_time_raw: item.end_time_raw,
      source: "namecheap",
    }));

    await client
      .from("active_auctions")
      .upsert(activeRows, { onConflict: "domain" });
  }

  return soldItems.length;
}

// ---------------------------------------------------------------------------
// 적응형 동기화: 급한 경매 없으면 5분 간격, 있으면 매번(1분) 실행
// → cron-job.org는 1분마다 호출하지만 서버에서 스킵 여부 결정
// ---------------------------------------------------------------------------
const URGENT_THRESHOLD_MS = 30 * 60 * 1000; // 30분
const IDLE_INTERVAL_MS = 5 * 60 * 1000; // 5분

async function shouldSkip(): Promise<{ skip: boolean; reason: string }> {
  try {
    const client = createServiceClient();

    // 가장 빨리 끝나는 경매의 남은 시간 확인
    const { data } = await client
      .from("active_auctions")
      .select("end_time_raw")
      .order("end_time_raw", { ascending: true })
      .limit(1);

    if (!data || data.length === 0) {
      return { skip: false, reason: "no_auctions" };
    }

    const soonestEnd = new Date(data[0].end_time_raw ?? "").getTime();
    if (isNaN(soonestEnd)) return { skip: false, reason: "invalid_time" };

    const remainingMs = soonestEnd - Date.now();

    // 30분 이하 남은 경매 있음 → 매번 실행
    if (remainingMs <= URGENT_THRESHOLD_MS) {
      return { skip: false, reason: `urgent_${Math.round(remainingMs / 60000)}min` };
    }

    // 30분 이상 남음 → 마지막 동기화로부터 5분 안 지났으면 스킵
    const { data: latest } = await client
      .from("active_auctions")
      .select("crawled_at")
      .order("crawled_at", { ascending: false })
      .limit(1);

    if (latest && latest.length > 0 && latest[0].crawled_at) {
      const lastSync = new Date(latest[0].crawled_at).getTime();
      const elapsed = Date.now() - lastSync;
      if (elapsed < IDLE_INTERVAL_MS) {
        return { skip: true, reason: `idle_${Math.round(elapsed / 1000)}s_ago` };
      }
    }

    return { skip: false, reason: "stale" };
  } catch {
    return { skip: false, reason: "check_error" };
  }
}

export async function GET(request: NextRequest) {
  const startTime = Date.now();

  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // 적응형 스킵 판단
    const { skip, reason } = await shouldSkip();
    if (skip) {
      return NextResponse.json({
        ok: true,
        skipped: true,
        reason,
        duration_ms: Date.now() - startTime,
      });
    }

    const currentItems = await fetchAllAuctions();
    currentItems.sort((a, b) => b.bid_count - a.bid_count);

    const soldCount = await detectAndSaveSold(currentItems);

    const duration_ms = Date.now() - startTime;

    return NextResponse.json({
      ok: true,
      synced: currentItems.length,
      sold: soldCount,
      reason,
      duration_ms,
    });
  } catch (err) {
    console.error("sync-auctions error:", err);
    return NextResponse.json({ error: "처리 중 오류" }, { status: 500 });
  }
}
