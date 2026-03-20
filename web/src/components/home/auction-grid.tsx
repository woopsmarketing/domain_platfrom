"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";

interface Auction {
  domain: string;
  tld: string;
  current_price: number;
  bid_count: number | null;
  end_time_raw: string | null;
  crawled_at: string;
}

function getTimeLeft(endTimeRaw: string | null): {
  text: string;
  urgent: boolean;
  expired: boolean;
} {
  if (!endTimeRaw) return { text: "", urgent: false, expired: false };

  const end = new Date(endTimeRaw).getTime();
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

function AuctionCard({ auction }: { auction: Auction }) {
  const [timeLeft, setTimeLeft] = useState(() =>
    getTimeLeft(auction.end_time_raw)
  );

  useEffect(() => {
    if (!auction.end_time_raw) return;
    const timer = setInterval(() => {
      setTimeLeft(getTimeLeft(auction.end_time_raw));
    }, 1000);
    return () => clearInterval(timer);
  }, [auction.end_time_raw]);

  return (
    <Link href={`/domain/${auction.domain}`}>
      <Card className="group h-full border-border/60 transition-all hover:border-orange-500/30 hover:shadow-md hover:shadow-orange-500/5">
        <CardContent className="p-4">
          <span className="block truncate text-sm font-semibold group-hover:text-orange-600 transition-colors">
            {auction.domain}
          </span>

          <div className="mt-3 flex items-center justify-between">
            <span className="text-lg font-bold text-primary">
              {formatPrice(auction.current_price)}
            </span>
            {auction.bid_count != null && auction.bid_count > 0 && (
              <Badge
                variant="secondary"
                className="rounded-md text-xs font-normal"
              >
                {auction.bid_count}건
              </Badge>
            )}
          </div>

          {timeLeft.text && (
            <div
              className={`mt-2 flex items-center gap-1.5 text-xs ${
                timeLeft.expired
                  ? "text-muted-foreground"
                  : timeLeft.urgent
                  ? "text-red-500 font-medium"
                  : "text-muted-foreground"
              }`}
            >
              {!timeLeft.expired && (
                <span className={`inline-block h-1.5 w-1.5 rounded-full ${
                  timeLeft.urgent ? "bg-red-500 animate-pulse" : "bg-green-500"
                }`} />
              )}
              <span>{timeLeft.expired ? "경매 종료" : `${timeLeft.text} 남음`}</span>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}

export function AuctionGrid({ auctions }: { auctions: Auction[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {auctions.map((auction) => (
        <AuctionCard key={auction.domain} auction={auction} />
      ))}
    </div>
  );
}
