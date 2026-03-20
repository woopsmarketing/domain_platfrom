"use client";

import { useEffect, useState, useCallback } from "react";
import { Flame, TrendingUp, RefreshCw } from "lucide-react";
import { AuctionGrid } from "./auction-grid";

interface ActiveAuction {
  domain: string;
  tld: string;
  current_price: number;
  bid_count: number | null;
  end_time_raw: string | null;
  crawled_at: string;
}

const REFRESH_INTERVAL = 30 * 1000; // 30초마다 갱신

export function AuctionPageClient() {
  const [auctions, setAuctions] = useState<ActiveAuction[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchAuctions = useCallback(async () => {
    try {
      const resp = await fetch("/api/active-auctions");
      const data = await resp.json();
      // API가 실시간으로 Namecheap에서 가져오므로 추가 필터링 불필요
      setAuctions(data.items ?? []);
      setLastUpdated(new Date());
    } catch {
      // 에러 시 기존 데이터 유지
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAuctions();

    // 5분마다 자동 갱신
    const timer = setInterval(fetchAuctions, REFRESH_INTERVAL);
    return () => clearInterval(timer);
  }, [fetchAuctions]);

  const totalBids = auctions.reduce((sum, a) => sum + (a.bid_count || 0), 0);

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
          30초마다 최신 데이터로 자동 갱신됩니다.
        </p>
      </div>

      {/* Stats */}
      <div className="mb-8 grid grid-cols-2 gap-4">
        <div className="rounded-xl border border-border/60 bg-muted/30 p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <Flame className="h-3.5 w-3.5" />
            진행 중
          </div>
          <p className="text-2xl font-bold">
            {auctions.length}
            <span className="text-sm font-normal text-muted-foreground ml-1">건</span>
          </p>
        </div>
        <div className="rounded-xl border border-border/60 bg-muted/30 p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <TrendingUp className="h-3.5 w-3.5" />
            총 입찰
          </div>
          <p className="text-2xl font-bold">
            {totalBids.toLocaleString()}
            <span className="text-sm font-normal text-muted-foreground ml-1">건</span>
          </p>
        </div>
      </div>

      {/* Last updated + manual refresh */}
      {lastUpdated && (
        <div className="mb-4 flex items-center gap-3 text-xs text-muted-foreground">
          <span>
            마지막 갱신: {lastUpdated.toLocaleTimeString("ko-KR")}
          </span>
          <button
            onClick={() => { setLoading(true); fetchAuctions(); }}
            className="inline-flex items-center gap-1 rounded-md px-2 py-1 hover:bg-muted transition-colors"
          >
            <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} />
            새로고침
          </button>
        </div>
      )}

      {/* Content */}
      {loading && auctions.length === 0 ? (
        <div className="rounded-xl border border-border/60 p-16 text-center">
          <RefreshCw className="mx-auto h-6 w-6 text-muted-foreground animate-spin mb-3" />
          <p className="text-muted-foreground">경매 데이터를 불러오는 중...</p>
        </div>
      ) : auctions.length > 0 ? (
        <AuctionGrid auctions={auctions} />
      ) : (
        <div className="rounded-xl border border-dashed border-border/60 p-16 text-center">
          <Flame className="mx-auto h-8 w-8 text-muted-foreground/50 mb-3" />
          <p className="text-muted-foreground">현재 진행 중인 인기 경매가 없습니다.</p>
          <p className="text-sm text-muted-foreground/70 mt-1">데이터는 30초마다 갱신됩니다.</p>
        </div>
      )}
    </div>
  );
}
