import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

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
const MAX_PAGES = 20;

interface AuctionItem {
  domain: string;
  tld: string;
  current_price: number;
  bid_count: number;
  end_time_raw: string;
}

async function fetchPage(
  page: number,
  sortCol: string,
  sortDir: string
): Promise<{ items: Record<string, unknown>[]; total: number }> {
  const payload = {
    operationName: "SaleTable",
    variables: {
      filter: {},
      sort: [{ column: sortCol, direction: sortDir }],
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

/**
 * GET /api/active-auctions
 *
 * Namecheap GraphQL API를 실시간 호출하여
 * 24시간 이내 종료 + bids >= 2 경매 도메인을 반환합니다.
 */
export async function GET(request: NextRequest) {
  try {
    const results: AuctionItem[] = [];
    let page = 1;

    while (page <= MAX_PAGES) {
      const { items, total } = await fetchPage(page, "timeLeft", "asc");
      if (!items || items.length === 0) break;

      let passedDeadline = false;

      for (const item of items) {
        const endDate = (item.endDate as string) ?? "";

        if (!isWithinDeadline(endDate)) {
          passedDeadline = true;
          break;
        }

        const bidCount = Number(item.bidCount ?? 0);
        if (bidCount < MIN_BIDS) continue;

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

      if (passedDeadline) break;
      page++;
    }

    // bid_count 내림차순 정렬
    results.sort((a, b) => b.bid_count - a.bid_count);

    return NextResponse.json({
      items: results,
      updated_at: new Date().toISOString(),
    });
  } catch (err) {
    console.error("active-auctions error:", err);
    return NextResponse.json({ items: [], updated_at: null });
  }
}
