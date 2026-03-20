import type { Metadata } from "next";
import { Flame, Clock, TrendingUp } from "lucide-react";
import { createServiceClient } from "@/lib/supabase";
import { AuctionGrid } from "@/components/home/auction-grid";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "실시간 경매 도메인 — 인기 경매 현황",
  description:
    "현재 활발하게 입찰 경쟁이 진행 중인 도메인 경매 현황을 실시간으로 확인하세요. 입찰수, 남은 시간, 현재 가격을 한눈에 파악.",
  keywords: [
    "도메인 경매",
    "실시간 경매",
    "도메인 입찰",
    "도메인 경매 현황",
    "인기 경매 도메인",
  ],
};

interface ActiveAuction {
  domain: string;
  tld: string;
  current_price: number;
  bid_count: number | null;
  end_time_raw: string | null;
  crawled_at: string;
}

async function getActiveAuctions(): Promise<ActiveAuction[]> {
  try {
    const client = createServiceClient();
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const { data, error } = await client
      .from("active_auctions")
      .select("domain, tld, current_price, bid_count, end_time_raw, crawled_at")
      .gte("crawled_at", oneDayAgo)
      .order("bid_count", { ascending: false, nullsFirst: false })
      .limit(200);

    if (error) {
      console.error("auctions page fetch error:", error.message);
      return [];
    }
    return (data ?? []) as ActiveAuction[];
  } catch {
    return [];
  }
}

export default async function AuctionsPage() {
  const auctions = await getActiveAuctions();

  // 통계
  const totalBids = auctions.reduce((sum, a) => sum + (a.bid_count || 0), 0);
  const avgPrice =
    auctions.length > 0
      ? Math.round(
          auctions.reduce((sum, a) => sum + a.current_price, 0) / auctions.length
        )
      : 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/10">
            <Flame className="h-5 w-5 text-orange-500" />
          </div>
          <h1 className="text-2xl font-bold sm:text-3xl">실시간 경매 도메인</h1>
        </div>
        <p className="text-muted-foreground max-w-2xl">
          현재 활발하게 입찰 경쟁이 진행 중인 도메인입니다.
          남은 시간이 실시간으로 표시되며, 2분마다 데이터가 갱신됩니다.
        </p>
      </div>

      {/* Stats */}
      <div className="mb-8 grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-border/60 bg-muted/30 p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <Flame className="h-3.5 w-3.5" />
            진행 중
          </div>
          <p className="text-2xl font-bold">{auctions.length}<span className="text-sm font-normal text-muted-foreground ml-1">건</span></p>
        </div>
        <div className="rounded-xl border border-border/60 bg-muted/30 p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <TrendingUp className="h-3.5 w-3.5" />
            총 입찰
          </div>
          <p className="text-2xl font-bold">{totalBids.toLocaleString()}<span className="text-sm font-normal text-muted-foreground ml-1">건</span></p>
        </div>
        <div className="rounded-xl border border-border/60 bg-muted/30 p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <Clock className="h-3.5 w-3.5" />
            평균 가격
          </div>
          <p className="text-2xl font-bold">${avgPrice.toLocaleString()}</p>
        </div>
      </div>

      {/* Filter badges */}
      <div className="mb-6 flex items-center gap-2">
        <Badge variant="secondary" className="rounded-full text-xs">
          입찰 2건 이상
        </Badge>
        <Badge variant="secondary" className="rounded-full text-xs">
          24시간 이내 종료
        </Badge>
        <span className="text-xs text-muted-foreground">
          · 2분마다 자동 갱신
        </span>
      </div>

      {/* Auction grid */}
      {auctions.length > 0 ? (
        <AuctionGrid auctions={auctions} />
      ) : (
        <div className="rounded-xl border border-dashed border-border/60 p-16 text-center">
          <Flame className="mx-auto h-8 w-8 text-muted-foreground/50 mb-3" />
          <p className="text-muted-foreground">
            현재 진행 중인 인기 경매가 없습니다.
          </p>
          <p className="text-sm text-muted-foreground/70 mt-1">
            데이터는 주기적으로 갱신됩니다.
          </p>
        </div>
      )}
    </div>
  );
}
