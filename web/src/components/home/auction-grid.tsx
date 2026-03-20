"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { ArrowDownWideNarrow, Clock, DollarSign, Loader2 } from "lucide-react";

interface Auction {
  domain: string;
  tld: string;
  current_price: number;
  bid_count: number | null;
  end_time_raw: string | null;
  crawled_at?: string;
}

type SortMode = "bids" | "time" | "price";

function getTimeLeft(endTimeRaw: string | null): {
  text: string;
  urgent: boolean;
  checking: boolean;
} {
  if (!endTimeRaw) return { text: "", urgent: false, checking: false };

  const end = new Date(endTimeRaw).getTime();
  if (isNaN(end)) {
    return { text: endTimeRaw, urgent: false, checking: false };
  }

  const now = Date.now();
  const diff = end - now;

  // 0초 이하: "종료" 대신 "확인 중..." — 30초 후 API가 진짜 종료/연장 판단
  if (diff <= 0) return { text: "확인 중...", urgent: true, checking: true };

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  const totalMinutes = hours * 60 + minutes;
  const isUrgent = totalMinutes < 10; // 10분 미만 빨간색

  if (hours > 0) {
    return {
      text: `${hours}시간 ${minutes}분 ${seconds}초`,
      urgent: isUrgent,
      checking: false,
    };
  }
  if (minutes > 0) {
    return {
      text: `${minutes}분 ${seconds}초`,
      urgent: isUrgent,
      checking: false,
    };
  }
  return { text: `${seconds}초`, urgent: true, checking: false };
}

function TimeCell({ endTimeRaw }: { endTimeRaw: string | null }) {
  const [timeLeft, setTimeLeft] = useState(() => getTimeLeft(endTimeRaw));

  useEffect(() => {
    // endTimeRaw가 변경되면 즉시 업데이트 (API 갱신 반영)
    setTimeLeft(getTimeLeft(endTimeRaw));
  }, [endTimeRaw]);

  useEffect(() => {
    if (!endTimeRaw) return;
    const end = new Date(endTimeRaw).getTime();
    if (isNaN(end)) return;

    const timer = setInterval(() => {
      setTimeLeft(getTimeLeft(endTimeRaw));
    }, 1000);
    return () => clearInterval(timer);
  }, [endTimeRaw]);

  if (!timeLeft.text) return <span className="text-muted-foreground">—</span>;

  if (timeLeft.checking) {
    return (
      <span className="inline-flex items-center gap-1.5 text-amber-500 font-medium">
        <Loader2 className="h-3 w-3 animate-spin" />
        확인 중...
      </span>
    );
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

  // 종료된 경매를 즉시 제거하지 않음
  // API가 30초마다 갱신 → 진짜 종료된 건 다음 갱신에서 목록에서 사라짐
  // "확인 중..." 상태는 유지
  const sorted = useMemo(() => {
    const list = [...auctions];
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
  }, [auctions, sortMode]);

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
        {sorted.length}개 경매 · 30초마다 자동 갱신
      </p>
    </div>
  );
}
