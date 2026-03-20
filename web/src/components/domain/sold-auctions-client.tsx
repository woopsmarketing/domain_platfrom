"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { Trophy, Lock, ArrowDownWideNarrow, Clock, DollarSign } from "lucide-react";

interface SoldDomain {
  id: string;
  name: string;
  tld: string;
  source: string;
  soldAt: string;
  soldPrice: number;
  bidCount?: number | null;
}

type SortMode = "recent" | "price_desc" | "price_asc";

function formatSoldDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "—";
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffHours < 1) return "방금 전";
    if (diffHours < 24) return `${diffHours}시간 전`;
    return d.toLocaleDateString("ko-KR", { month: "2-digit", day: "2-digit" });
  } catch {
    return "—";
  }
}

function formatUSD(price: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

export function SoldAuctionsClient() {
  const [domains, setDomains] = useState<SoldDomain[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortMode, setSortMode] = useState<SortMode>("recent");

  useEffect(() => {
    async function load() {
      try {
        const resp = await fetch("/api/sold-domains");
        const data = await resp.json();
        setDomains(data.items ?? []);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const now = Date.now();
  const oneDayMs = 24 * 60 * 60 * 1000;

  const { recent, locked } = useMemo(() => {
    const r: SoldDomain[] = [];
    const l: SoldDomain[] = [];
    for (const d of domains) {
      const soldTime = new Date(d.soldAt).getTime();
      if (now - soldTime <= oneDayMs) {
        r.push(d);
      } else {
        l.push(d);
      }
    }
    return { recent: r, locked: l };
  }, [domains, now]);

  const sorted = useMemo(() => {
    const list = [...recent];
    switch (sortMode) {
      case "price_desc":
        return list.sort((a, b) => b.soldPrice - a.soldPrice);
      case "price_asc":
        return list.sort((a, b) => a.soldPrice - b.soldPrice);
      case "recent":
      default:
        return list.sort((a, b) => new Date(b.soldAt).getTime() - new Date(a.soldAt).getTime());
    }
  }, [recent, sortMode]);

  const totalValue = recent.reduce((sum, d) => sum + d.soldPrice, 0);

  const sortButtons: { mode: SortMode; label: string; icon: React.ReactNode }[] = [
    { mode: "recent", label: "최근순", icon: <Clock className="h-3.5 w-3.5" /> },
    { mode: "price_desc", label: "고가순", icon: <DollarSign className="h-3.5 w-3.5" /> },
    { mode: "price_asc", label: "저가순", icon: <ArrowDownWideNarrow className="h-3.5 w-3.5" /> },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-500/10">
            <Trophy className="h-5 w-5 text-green-500" />
          </div>
          <h1 className="text-2xl font-bold sm:text-3xl">낙찰 이력</h1>
        </div>
        <p className="text-muted-foreground max-w-2xl">
          최근 24시간 이내 낙찰된 도메인을 무료로 확인하세요.
        </p>
      </div>

      {/* Stats */}
      <div className="mb-8 grid grid-cols-2 gap-4">
        <div className="rounded-xl border border-border/60 bg-muted/30 p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <Trophy className="h-3.5 w-3.5" />
            최근 24시간 낙찰
          </div>
          <p className="text-2xl font-bold">
            {recent.length}
            <span className="text-sm font-normal text-muted-foreground ml-1">건</span>
          </p>
        </div>
        <div className="rounded-xl border border-border/60 bg-muted/30 p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <DollarSign className="h-3.5 w-3.5" />
            총 낙찰액
          </div>
          <p className="text-2xl font-bold">{formatUSD(totalValue)}</p>
        </div>
      </div>

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
      {loading ? (
        <div className="rounded-xl border border-border/60 p-16 text-center">
          <p className="text-muted-foreground">데이터를 불러오는 중...</p>
        </div>
      ) : sorted.length > 0 ? (
        <div className="overflow-x-auto rounded-xl border border-border/60">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/60 bg-muted/40">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">도메인</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">낙찰가</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">낙찰 시간</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((d) => (
                <tr
                  key={d.id}
                  className="border-b border-border/40 last:border-0 transition-colors hover:bg-muted/30"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/domain/${d.name}`}
                      className="font-medium text-foreground hover:text-green-600 transition-colors"
                    >
                      {d.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold tabular-nums">
                    {formatUSD(d.soldPrice)}
                  </td>
                  <td className="px-4 py-3 text-right text-muted-foreground text-xs whitespace-nowrap">
                    {formatSoldDate(d.soldAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-border/60 p-16 text-center">
          <Trophy className="mx-auto h-8 w-8 text-muted-foreground/50 mb-3" />
          <p className="text-muted-foreground">최근 24시간 이내 낙찰된 도메인이 없습니다.</p>
        </div>
      )}

      {/* Locked section */}
      {locked.length > 0 && (
        <div className="mt-8">
          <div className="flex items-center gap-2 mb-4">
            <Lock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">
              이전 낙찰 이력 ({locked.length}건)
            </span>
          </div>
          <div className="rounded-xl border border-border/60 bg-muted/20 p-8 text-center">
            <Lock className="mx-auto h-10 w-10 text-muted-foreground/30 mb-3" />
            <p className="font-medium text-muted-foreground">
              24시간 이전 낙찰 이력은 프리미엄 기능입니다
            </p>
            <p className="text-sm text-muted-foreground/70 mt-1">
              곧 구독 서비스로 제공될 예정입니다.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
