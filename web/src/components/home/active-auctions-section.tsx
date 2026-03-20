import Link from "next/link";
import { Flame, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createServiceClient } from "@/lib/supabase";
import { formatPrice } from "@/lib/utils";

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
    const client = createServiceClient();
    const sevenDaysAgo = new Date(
      Date.now() - 7 * 24 * 60 * 60 * 1000
    ).toISOString();

    const { data, error } = await client
      .from("active_auctions")
      .select(
        "domain, tld, current_price, bid_count, end_time_raw, crawled_at"
      )
      .gte("crawled_at", sevenDaysAgo)
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
  const auctions = await getActiveAuctions(10);

  if (auctions.length === 0) {
    return null;
  }

  return (
    <section className="border-b px-4 py-16">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-500/10">
              <Flame className="h-4 w-4 text-orange-500" />
            </div>
            <h2 className="text-xl font-semibold">
              인기 경매 도메인
            </h2>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {auctions.map((auction) => (
            <Link key={auction.domain} href={`/domain/${auction.domain}`}>
              <Card className="group border-border/60 transition-all hover:border-orange-500/30 hover:shadow-md hover:shadow-orange-500/5">
                <CardContent className="p-5">
                  <span className="block truncate text-sm font-medium group-hover:text-orange-600 transition-colors">
                    {auction.domain}
                  </span>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-base font-bold text-primary">
                      {formatPrice(auction.current_price)}
                    </span>
                    <div className="flex gap-1.5">
                      {auction.bid_count != null && auction.bid_count > 0 && (
                        <Badge
                          variant="secondary"
                          className="rounded-md text-xs font-normal"
                        >
                          {auction.bid_count}건 입찰
                        </Badge>
                      )}
                    </div>
                  </div>
                  {auction.end_time_raw && (
                    <p className="mt-2 text-xs text-muted-foreground truncate">
                      {auction.end_time_raw}
                    </p>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
