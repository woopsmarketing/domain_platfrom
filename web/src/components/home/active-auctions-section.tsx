import Link from "next/link";
import { Flame } from "lucide-react";
import { AuctionGrid } from "./auction-grid";
import { createServiceClient } from "@/lib/supabase";

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
    const supabase = createServiceClient();
    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from("active_auctions")
      .select("domain, tld, current_price, bid_count, end_time_raw")
      .gt("end_time_raw", now)
      .order("bid_count", { ascending: false })
      .limit(limit);

    if (error || !data) return [];

    const crawled_at = new Date().toISOString();
    return data.map((row) => ({
      domain: row.domain as string,
      tld: row.tld as string,
      current_price: Number(row.current_price ?? 0),
      bid_count: row.bid_count != null ? Number(row.bid_count) : null,
      end_time_raw: row.end_time_raw as string | null,
      crawled_at,
    }));
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
