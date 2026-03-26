"use client";

import { useState, useCallback, useRef } from "react";
import Link from "next/link";
import {
  Trophy,
  ArrowDownWideNarrow,
  Clock,
  DollarSign,
  Lock,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";

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

interface SoldAuctionsProps {
  initialItems: SoldDomain[];
  initialTotal: number;
  recent24hCount: number;
}

const PER_PAGE = 50;

function formatSoldDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "—";
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffHours < 1) return "방금 전";
    if (diffHours < 24) return `${diffHours}시간 전`;
    return d.toLocaleDateString("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit" });
  } catch {
    return "—";
  }
}

function isWithin24h(dateStr: string): boolean {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return false;
    return Date.now() - d.getTime() < 24 * 60 * 60 * 1000;
  } catch {
    return false;
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

export function SoldAuctionsClient({ initialItems, initialTotal, recent24hCount }: SoldAuctionsProps) {
  const { tier } = useAuth();
  const isProUser = tier === "pro";
  const [domains, setDomains] = useState<SoldDomain[]>(initialItems);
  const [loading, setLoading] = useState(false);
  const [sortMode, setSortMode] = useState<SortMode>("recent");
  const [total, setTotal] = useState(initialTotal);
  const [hasMore, setHasMore] = useState(initialItems.length < initialTotal);
  const pageRef = useRef(1);
  const loadMore = useCallback(async (sort: SortMode) => {
    const nextPage = pageRef.current + 1;
    setLoading(true);
    try {
      const resp = await fetch(
        `/api/sold-domains?page=${nextPage}&per_page=${PER_PAGE}&sort=${sort}`
      );
      const data = await resp.json();
      const newItems: SoldDomain[] = data.items ?? [];
      setDomains((prev) => [...prev, ...newItems]);
      setTotal(data.total ?? 0);
      pageRef.current = nextPage;
      if (newItems.length < PER_PAGE) setHasMore(false);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchFresh = useCallback(async (sort: SortMode) => {
    setLoading(true);
    pageRef.current = 1;
    try {
      const resp = await fetch(
        `/api/sold-domains?page=1&per_page=${PER_PAGE}&sort=${sort}`
      );
      const data = await resp.json();
      setDomains(data.items ?? []);
      setTotal(data.total ?? 0);
      setHasMore((data.items ?? []).length < (data.total ?? 0));
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSort = (mode: SortMode) => {
    if (mode === sortMode) return;
    setSortMode(mode);
    setHasMore(true);
    fetchFresh(mode);
  };

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
          <h1 className="text-2xl font-bold sm:text-3xl">도메인 거래 시세</h1>
        </div>
        <p className="text-muted-foreground max-w-2xl">
          도메인이 실제로 얼마에 거래되는지 확인하세요. 경매 도메인과 만료 도메인의 실제 낙찰 가격, 입찰 수를 무료로 조회할 수 있습니다.
          도메인 구매 전 시세를 파악하고 적정 가격을 판단하는 데 활용하세요.
        </p>
      </div>

      {/* Stats */}
      <div className="mb-8 grid grid-cols-2 gap-4">
        <div className="rounded-xl border border-border/60 bg-muted/30 p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <Clock className="h-3.5 w-3.5" />
            최근 24시간 낙찰
          </div>
          <p className="text-2xl font-bold">
            {recent24hCount.toLocaleString()}
            <span className="text-sm font-normal text-muted-foreground ml-1">건</span>
          </p>
        </div>
        <div className="rounded-xl border border-border/60 bg-muted/30 p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <Trophy className="h-3.5 w-3.5" />
            전체 낙찰 건수
          </div>
          <p className="text-2xl font-bold">
            {total.toLocaleString()}
            <span className="text-sm font-normal text-muted-foreground ml-1">건</span>
          </p>
        </div>
      </div>

      {/* Sort buttons */}
      <div className="mb-4 flex items-center gap-2">
        <span className="text-xs text-muted-foreground mr-1">정렬</span>
        {sortButtons.map((btn) => (
          <button
            key={btn.mode}
            onClick={() => handleSort(btn.mode)}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-2.5 text-xs min-h-[44px] sm:py-1.5 sm:min-h-0 font-medium transition-colors ${
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
      {domains.length > 0 ? (
        <div className="overflow-x-auto rounded-xl border border-border/60">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/60 bg-muted/40">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">도메인</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">낙찰가</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground hidden sm:table-cell">입찰수</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">낙찰일</th>
              </tr>
            </thead>
            <tbody>
              {domains.map((d) => {
                const free = isProUser || isWithin24h(d.soldAt);
                return (
                  <tr
                    key={d.id}
                    className="border-b border-border/40 last:border-0 transition-colors hover:bg-muted/30"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/domain/${d.name}`}
                        className="font-medium text-foreground hover:text-green-600 transition-colors block max-w-[160px] truncate sm:max-w-none sm:overflow-visible sm:whitespace-normal"
                      >
                        {d.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {free ? (
                        <span className="font-semibold tabular-nums">{formatUSD(d.soldPrice)}</span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground"><Lock className="h-3 w-3" />Pro</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right hidden sm:table-cell">
                      {free ? (
                        <span className="tabular-nums">{d.bidCount != null && d.bidCount > 0 ? `${d.bidCount}건` : "—"}</span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground"><Lock className="h-3 w-3" />Pro</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {free ? (
                        <span className="text-muted-foreground text-xs whitespace-nowrap">{formatSoldDate(d.soldAt)}</span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground"><Lock className="h-3 w-3" />Pro</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : !loading ? (
        <div className="rounded-xl border border-dashed border-border/60 p-16 text-center">
          <Trophy className="mx-auto h-8 w-8 text-muted-foreground/50 mb-3" />
          <p className="text-muted-foreground">낙찰된 도메인이 없습니다.</p>
        </div>
      ) : null}

      {/* 더 보기 버튼 */}
      {hasMore && domains.length > 0 && (
        <div className="mt-4 flex justify-center">
          <button
            onClick={() => loadMore(sortMode)}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg border border-border/60 px-6 py-3 text-sm font-medium w-full sm:w-auto justify-center transition-colors hover:bg-muted disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                불러오는 중...
              </>
            ) : (
              <>더 보기 ({domains.length.toLocaleString()} / {total.toLocaleString()})</>
            )}
          </button>
        </div>
      )}
      {!hasMore && domains.length > 0 && (
        <p className="mt-4 text-xs text-muted-foreground text-center">
          전체 {total.toLocaleString()}건을 모두 불러왔습니다.
        </p>
      )}

      {/* Pro 안내 — Free 사용자만 표시 */}
      {domains.length > 0 && !isProUser && (
        <div className="mt-2 rounded-xl border border-primary/20 bg-gradient-to-r from-primary/5 to-blue-500/5 p-4 flex items-center gap-3">
          <Lock className="h-5 w-5 shrink-0 text-primary" />
          <div>
            <p className="text-sm font-semibold">24시간 이전 낙찰 데이터는 Pro 전용입니다</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              최근 24시간 데이터는 무료로 확인할 수 있습니다. Pro 구독으로 전체 이력의 낙찰가, 입찰수, 낙찰일을 확인하세요.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
