import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";

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

// ---------------------------------------------------------------------------
// 서버 사이드 낙찰 감지:
// active_auctions(이전 스냅샷) vs 현재 Namecheap 데이터 비교
// → 사라진 도메인 = 낙찰 → sold_auctions에 저장
// → active_auctions를 현재 데이터로 갱신
// ---------------------------------------------------------------------------
async function detectAndSaveSold(currentItems: AuctionItem[]) {
  try {
    const client = createServiceClient();

    // 1. active_auctions에서 이전 스냅샷 가져오기
    const { data: prevData } = await client
      .from("active_auctions")
      .select("domain, tld, current_price, bid_count");

    const prevMap = new Map<string, { domain: string; tld: string; current_price: number; bid_count: number | null }>();
    for (const row of prevData ?? []) {
      prevMap.set(row.domain, row);
    }

    // 2. 현재 목록에 없는 도메인 = 낙찰
    const currentDomains = new Set(currentItems.map((i) => i.domain));
    const soldItems = [];
    for (const [domain, data] of prevMap) {
      if (!currentDomains.has(domain)) {
        soldItems.push(data);
      }
    }

    // 3. 낙찰된 도메인 sold_auctions에 저장
    if (soldItems.length > 0) {
      const rows = soldItems.map((item) => ({
        domain: item.domain,
        tld: item.tld,
        price_usd: item.current_price,
        bid_count: item.bid_count,
        sold_at: new Date().toISOString(),
        platform: "namecheap",
      }));

      await client.from("sold_auctions").insert(rows);
    }

    // 4. active_auctions를 현재 데이터로 갱신 (전체 교체)
    // 기존 데이터 삭제
    await client.from("active_auctions").delete().neq("domain", "");

    // 현재 데이터 삽입
    if (currentItems.length > 0) {
      const rows = currentItems.map((item) => ({
        domain: item.domain,
        tld: item.tld,
        current_price: item.current_price,
        bid_count: item.bid_count,
        end_time_raw: item.end_time_raw,
        source: "namecheap",
      }));

      await client.from("active_auctions").upsert(rows, { onConflict: "domain" });
    }
  } catch (err) {
    console.error("detectAndSaveSold error:", err);
  }
}

/**
 * GET /api/active-auctions
 *
 * 1. Namecheap GraphQL 실시간 호출 (24h 이내 + bids >= 2)
 * 2. active_auctions 테이블과 비교 → 사라진 도메인 = 낙찰 → sold_auctions 저장
 * 3. active_auctions를 현재 데이터로 갱신
 * 4. 결과 반환
 */
export async function GET(request: NextRequest) {
  try {
    const results: AuctionItem[] = [];
    let page = 1;

    while (page <= MAX_PAGES) {
      const { items } = await fetchPage(page, "timeLeft", "asc");
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

    // 서버 사이드 낙찰 감지 (비동기 — 응답 지연 없음)
    detectAndSaveSold(results).catch(() => {});

    return NextResponse.json({
      items: results,
      updated_at: new Date().toISOString(),
    });
  } catch (err) {
    console.error("active-auctions error:", err);
    return NextResponse.json({ items: [], updated_at: null });
  }
}
