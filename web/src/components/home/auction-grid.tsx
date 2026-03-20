"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { ArrowDownWideNarrow, Clock, DollarSign } from "lucide-react";

interface Auction {
  domain: string;
  tld: string;
  current_price: number;
  bid_count: number | null;
  end_time_raw: string | null;
  crawled_at: string;
}

type SortMode = "bids" | "time" | "price";

function getTimeLeft(endTimeRaw: string | null): {
  text: string;
  urgent: boolean;
  expired: boolean;
} {
  if (!endTimeRaw) return { text: "", urgent: false, expired: false };

  const end = new Date(endTimeRaw).getTime();
  if (isNaN(end)) {
    // "11 days", "2 hours", "1 month" 같은 상대 시간 텍스트 그대로 표시
    return { text: endTimeRaw, urgent: false, expired: false };
  }

  const now = Date.now();
  const diff = end - now;

  if (diff <= 0) return { text: "종료", urgent: true, expired: true };

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  if (hours > 0) {
    return {
      text: `${hours}시간 ${minutes}분 ${seconds}초`,
      urgent: hours < 1,
      expired: false,
    };
  }
  if (minutes > 0) {
    return {
      text: `${minutes}분 ${seconds}초`,
      urgent: true,
      expired: false,
    };
  }
  return { text: `${seconds}초`, urgent: true, expired: false };
}

function TimeCell({ endTimeRaw }: { endTimeRaw: string | null }) {
  const [timeLeft, setTimeLeft] = useState(() => getTimeLeft(endTimeRaw));

  useEffect(() => {
    if (!endTimeRaw) return;
    const end = new Date(endTimeRaw).getTime();
    if (isNaN(end)) return; // 상대 시간 텍스트는 카운트다운 불필요

    const timer = setInterval(() => {
      setTimeLeft(getTimeLeft(endTimeRaw));
    }, 1000);
    return () => clearInterval(timer);
  }, [endTimeRaw]);

  if (!timeLeft.text) return <span className="text-muted-foreground">—</span>;

  if (timeLeft.expired) {
    return <span className="text-muted-foreground">종료</span>;
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 ${
        timeLeft.urgent ? "text-red-500 font-medium" : "text-foreground"
      }`}
    >
      {timeLeft.urgent && (
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
      )}
      {timeLeft.text}
    </span>
  );
}

function formatUSD(price: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

export function AuctionGrid({ auctions }: { auctions: Auction[] }) {
  const [sortMode, setSortMode] = useState<SortMode>("bids");

  // Filter out expired auctions on client side
  const activeAuctions = useMemo(() => {
    const now = Date.now();
    return auctions.filter((a) => {
      if (!a.end_time_raw) return true; // no end time, keep it
      const end = new Date(a.end_time_raw).getTime();
      if (isNaN(end)) return true; // unparseable, keep it
      return end > now;
    });
  }, [auctions]);

  const sorted = useMemo(() => {
    const list = [...activeAuctions];
    switch (sortMode) {
      case "bids":
        return list.sort((a, b) => (b.bid_count || 0) - (a.bid_count || 0));
      case "time": {
        return list.sort((a, b) => {
          const aEnd = a.end_time_raw
            ? new Date(a.end_time_raw).getTime()
            : Infinity;
          const bEnd = b.end_time_raw
            ? new Date(b.end_time_raw).getTime()
            : Infinity;
          const aVal = isNaN(aEnd) ? Infinity : aEnd;
          const bVal = isNaN(bEnd) ? Infinity : bEnd;
          return aVal - bVal;
        });
      }
      case "price":
        return list.sort((a, b) => b.current_price - a.current_price);
      default:
        return list;
    }
  }, [activeAuctions, sortMode]);

  const sortButtons: { mode: SortMode; label: string; icon: React.ReactNode }[] = [
    {
      mode: "bids",
      label: "입찰순",
      icon: <ArrowDownWideNarrow className="h-3.5 w-3.5" />,
    },
    {
      mode: "time",
      label: "시간순",
      icon: <Clock className="h-3.5 w-3.5" />,
    },
    {
      mode: "price",
      label: "가격순",
      icon: <DollarSign className="h-3.5 w-3.5" />,
    },
  ];

  if (sorted.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-8 text-center">
        현재 진행 중인 경매가 없습니다.
      </p>
    );
  }

  return (
    <div>
      {/* Sort buttons */}
      <div className="mb-4 flex items-center gap-2">
        <span className="text-xs text-muted-foreground mr-1">정렬</span>
        {sortButtons.map((btn) => (
          <button
            key={btn.mode}
            onClick={() => setSortMode(btn.mode)}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              sortMode === btn.mode
                ? "bg-primary text-primary-foreground"
                : "bg-muted/60 text-muted-foreground hover:bg-muted"
            }`}
          >
            {btn.icon}
            {btn.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-border/60">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/60 bg-muted/40">
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                도메인
              </th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                현재가
              </th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                입찰수
              </th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                남은 시간
              </th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((auction) => (
              <tr
                key={auction.domain}
                className="border-b border-border/40 last:border-0 transition-colors hover:bg-muted/30"
              >
                <td className="px-4 py-3">
                  <Link
                    href={`/domain/${auction.domain}`}
                    className="font-medium text-foreground hover:text-orange-600 transition-colors"
                  >
                    {auction.domain}
                  </Link>
                </td>
                <td className="px-4 py-3 text-right font-semibold whitespace-nowrap">
                  {formatUSD(auction.current_price)}
                </td>
                <td className="px-4 py-3 text-right tabular-nums">
                  {auction.bid_count != null && auction.bid_count > 0
                    ? `${auction.bid_count}건`
                    : "—"}
                </td>
                <td className="px-4 py-3 text-right whitespace-nowrap text-xs">
                  <TimeCell endTimeRaw={auction.end_time_raw} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-3 text-xs text-muted-foreground text-right">
        {sorted.length}개 경매 진행 중
      </p>
    </div>
  );
}
