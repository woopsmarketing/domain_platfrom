import Link from "next/link";
import { Flame } from "lucide-react";
import { AuctionGrid } from "./auction-grid";

const GRAPHQL_URL = "https://aftermarketapi.namecheap.com/client/graphql";
const GRAPHQL_HASH =
  "fe84e690294ebd46f5cbc0a2b3fe1fe7fc606395c28f54afab18ff6521d98110";

interface ActiveAuction {
  domain: string;
  tld: string;
  current_price: number;
  bid_count: number | null;
  end_time_raw: string | null;
  crawled_at: string;
}

async function getActiveAuctions(limit = 10): Promise<ActiveAuction[]> {
  try {
    // Namecheap GraphQL API 직접 호출 — timeLeft 오름차순
    const resp = await fetch(GRAPHQL_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        Origin: "https://www.namecheap.com",
        Referer: "https://www.namecheap.com/",
      },
      body: JSON.stringify({
        operationName: "SaleTable",
        variables: {
          filter: {},
          sort: [{ column: "bidCount", direction: "desc" }],
          page: 1,
          pageSize: 100,
        },
        extensions: {
          persistedQuery: { version: 1, sha256Hash: GRAPHQL_HASH },
        },
      }),
      cache: "no-store",
    });

    if (!resp.ok) return [];

    const data = await resp.json();
    const items = data?.data?.sales?.items ?? [];
    const now = Date.now();
    const maxMs = 24 * 60 * 60 * 1000;

    const results: ActiveAuction[] = [];
    for (const item of items) {
      const endDate = item.endDate ?? "";
      const end = new Date(endDate).getTime();
      if (isNaN(end)) continue;
      const diff = end - now;
      if (diff <= 0 || diff > maxMs) continue;

      const bidCount = Number(item.bidCount ?? 0);
      if (bidCount < 2) continue;

      const domain = (item.product?.name ?? "").toLowerCase().trim();
      if (!domain || !domain.includes(".")) continue;

      const parts = domain.split(".");
      results.push({
        domain,
        tld: parts[parts.length - 1],
        current_price: Math.round(Number(item.price ?? 0)),
        bid_count: bidCount,
        end_time_raw: endDate,
        crawled_at: new Date().toISOString(),
      });

      if (results.length >= limit) break;
    }

    return results;
  } catch {
    return [];
  }
}

export async function ActiveAuctionsSection() {
  const auctions = await getActiveAuctions(10);

  if (auctions.length === 0) {
    return null;
  }

  return (
    <section className="border-b px-4 py-16">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-500/10">
              <Flame className="h-4 w-4 text-orange-500" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">인기 경매 도메인</h2>
              <p className="text-sm text-muted-foreground">
                입찰 경쟁이 활발한 도메인 (실시간)
              </p>
            </div>
          </div>
          <Link
            href="/auctions"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            전체 보기 &rarr;
          </Link>
        </div>

        <AuctionGrid auctions={auctions} />
      </div>
    </section>
  );
}
