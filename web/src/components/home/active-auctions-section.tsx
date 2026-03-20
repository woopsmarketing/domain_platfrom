import Link from "next/link";
import { Flame } from "lucide-react";
import { createServiceClient } from "@/lib/supabase";
import { AuctionGrid } from "./auction-grid";

interface ActiveAuction {
  domain: string;
  tld: string;
  current_price: number;
  bid_count: number | null;
  end_time_raw: string | null;
  crawled_at: string;
}

async function getActiveAuctions(limit = 20): Promise<ActiveAuction[]> {
  try {
    const client = createServiceClient();
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const { data, error } = await client
      .from("active_auctions")
      .select("domain, tld, current_price, bid_count, end_time_raw, crawled_at")
      .gte("crawled_at", oneDayAgo)
      .order("bid_count", { ascending: false, nullsFirst: false })
      .limit(limit);

    if (error) {
      console.error("active-auctions fetch error:", error.message);
      return [];
    }

    return (data ?? []) as ActiveAuction[];
  } catch {
    return [];
  }
}

export async function ActiveAuctionsSection() {
  const auctions = await getActiveAuctions(20);

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
        </div>

        <AuctionGrid auctions={auctions} />
      </div>
    </section>
  );
}
