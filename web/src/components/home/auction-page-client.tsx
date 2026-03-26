"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Flame, AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuctionGrid } from "./auction-grid";

interface ActiveAuction {
  domain: string;
  tld: string;
  current_price: number;
  bid_count: number | null;
  end_time_raw: string | null;
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
      // 서버가 낙찰 감지 + DB 저장까지 처리 → 클라이언트는 표시만
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

  const urgentCount = auctions.filter((a) => {
    if (!a.end_time_raw) return false;
    const end = new Date(a.end_time_raw).getTime();
    if (isNaN(end)) return false;
    return (end - Date.now()) > 0 && (end - Date.now()) <= 10 * 60 * 1000;
  }).length;

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

      {/* Broker Banner */}
      <div className="mb-8 rounded-xl border border-primary/20 bg-primary/5 p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-semibold">원하는 도메인을 대신 구매해 드립니다</p>
          <p className="text-sm text-muted-foreground">경매 입찰부터 도메인 이전까지 전 과정을 대행합니다</p>
        </div>
        <Link href="/inquiry">
          <Button size="sm">대행 문의</Button>
        </Link>
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
        <div className={`rounded-xl border p-4 ${urgentCount > 0 ? "border-red-500/30 bg-red-500/5" : "border-border/60 bg-muted/30"}`}>
          <div className={`flex items-center gap-2 text-sm mb-1 ${urgentCount > 0 ? "text-red-500" : "text-muted-foreground"}`}>
            <AlertTriangle className="h-3.5 w-3.5" />
            종료 임박
          </div>
          <p className={`text-2xl font-bold ${urgentCount > 0 ? "text-red-500" : ""}`}>
            {urgentCount}
            <span className={`text-sm font-normal ml-1 ${urgentCount > 0 ? "text-red-400" : "text-muted-foreground"}`}>건</span>
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
