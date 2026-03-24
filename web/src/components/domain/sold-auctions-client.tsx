"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import {
  Trophy,
  ArrowDownWideNarrow,
  Clock,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Lock,
} from "lucide-react";

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

function formatUSD(price: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

export function SoldAuctionsClient({ initialItems, initialTotal, recent24hCount }: SoldAuctionsProps) {
  const [domains, setDomains] = useState<SoldDomain[]>(initialItems);
  const [loading, setLoading] = useState(false);
  const [sortMode, setSortMode] = useState<SortMode>("recent");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(initialTotal);
  const isInitialData = useRef(true); // 서버 초기 데이터를 아직 사용 중인지 추적

  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));

  const fetchData = useCallback(async (p: number, sort: SortMode) => {
    setLoading(true);
    try {
      const resp = await fetch(
        `/api/sold-domains?page=${p}&per_page=${PER_PAGE}&sort=${sort}`
      );
      const data = await resp.json();
      setDomains(data.items ?? []);
      setTotal(data.total ?? 0);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // 첫 로드 시(page=1, sort=recent) 서버 데이터가 아직 유효하면 스킵
    if (page === 1 && sortMode === "recent" && isInitialData.current) return;
    fetchData(page, sortMode);
  }, [page, sortMode, fetchData]);

  const handleSort = (mode: SortMode) => {
    isInitialData.current = false; // 정렬 변경 시 초기 데이터 무효화
    setSortMode(mode);
    setPage(1);
  };

  const goToPage = (p: number) => {
    const clamped = Math.max(1, Math.min(p, totalPages));
    setPage(clamped);
    window.scrollTo({ top: 0, behavior: "smooth" });
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
        <div className="relative rounded-xl border border-border/60 bg-muted/30 p-4 overflow-hidden">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <Trophy className="h-3.5 w-3.5" />
            전체 낙찰 건수
          </div>
          {/* 잠금 오버레이 */}
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm z-10">
            <Lock className="h-4 w-4 text-muted-foreground mb-1" />
            <span className="text-xs font-medium text-muted-foreground">Pro 전용</span>
          </div>
          <p className="text-2xl font-bold blur-sm select-none">
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
      {loading ? (
        <div className="rounded-xl border border-border/60 p-16 text-center">
          <p className="text-muted-foreground">데이터를 불러오는 중...</p>
        </div>
      ) : domains.length > 0 ? (
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
              {domains.map((d) => (
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
                  <td className="px-4 py-3 text-right tabular-nums hidden sm:table-cell">
                    {d.bidCount != null && d.bidCount > 0 ? `${d.bidCount}건` : "—"}
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
          <p className="text-muted-foreground">낙찰된 도메인이 없습니다.</p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-1">
          <button
            onClick={() => goToPage(1)}
            disabled={page === 1}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="첫 페이지"
          >
            <ChevronsLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => goToPage(page - 1)}
            disabled={page === 1}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="이전 페이지"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          {/* 페이지 번호 */}
          {(() => {
            const pages: number[] = [];
            const maxVisible = 5;
            let start = Math.max(1, page - Math.floor(maxVisible / 2));
            const end = Math.min(totalPages, start + maxVisible - 1);
            start = Math.max(1, end - maxVisible + 1);

            for (let i = start; i <= end; i++) pages.push(i);
            return pages.map((p) => (
              <button
                key={p}
                onClick={() => goToPage(p)}
                className={`inline-flex h-10 w-10 items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                  p === page
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted"
                }`}
              >
                {p}
              </button>
            ));
          })()}

          <button
            onClick={() => goToPage(page + 1)}
            disabled={page === totalPages}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="다음 페이지"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <button
            onClick={() => goToPage(totalPages)}
            disabled={page === totalPages}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="마지막 페이지"
          >
            <ChevronsRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* 페이지 정보 */}
      {total > 0 && (
        <p className="mt-3 text-xs text-muted-foreground text-center">
          전체 {total.toLocaleString()}건 중 {((page - 1) * PER_PAGE + 1).toLocaleString()}–
          {Math.min(page * PER_PAGE, total).toLocaleString()}건 표시
        </p>
      )}
    </div>
  );
}
