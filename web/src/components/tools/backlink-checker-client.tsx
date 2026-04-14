"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import {
  Search,
  Loader2,
  Lock,
  ExternalLink,
  LinkIcon,
  Globe,
  ShieldCheck,
  Users,
} from "lucide-react";
import { cleanDomain } from "@/lib/clean-domain";
import { useRateLimit } from "@/hooks/use-rate-limit";
import { UpgradeModal } from "@/components/ui/upgrade-modal";
import { trackEvent } from "@/lib/gtag";

interface BacklinkCounts {
  backlinks: {
    total: number;
    doFollow: number;
    fromHomePage: number;
    text: number;
    toHomePage: number;
  };
  domains: {
    total: number;
    doFollow: number;
    fromHomePage: number;
    toHomePage: number;
  };
}

interface BacklinkItem {
  url_from: string;
  url_to: string;
  title: string;
  anchor: string;
  nofollow: boolean;
  image: boolean;
  image_source: string;
  inlink_rank: number;
  domain_inlink_rank: number;
  first_seen: string;
  last_visited: string;
}

interface BacklinkData {
  counts: BacklinkCounts;
  backlinks: BacklinkItem[];
  truncated?: boolean;
  totalBacklinks?: number;
  error?: string;
}

function truncateUrl(url: string, maxLength = 50): string {
  if (url.length <= maxLength) return url;
  return url.slice(0, maxLength) + "...";
}

function StatCard({
  label,
  value,
  icon: Icon,
  loading,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  loading: boolean;
}) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className="h-4 w-4" />
        <span className="text-sm">{label}</span>
      </div>
      {loading ? (
        <div className="mt-2 h-8 w-20 animate-pulse rounded bg-muted" />
      ) : (
        <p className="mt-2 text-2xl font-bold">{value.toLocaleString()}</p>
      )}
    </div>
  );
}

export function BacklinkCheckerClient() {
  const [domain, setDomain] = useState("");
  const [data, setData] = useState<BacklinkData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { checkAndIncrement, showUpgrade, setShowUpgrade, isPro, remaining } =
    useRateLimit("backlink_check", 3);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!checkAndIncrement()) return;

      const d = cleanDomain(domain);
      if (!d || !d.includes(".")) return;

      setLoading(true);
      setError(null);
      setData(null);

      try {
        const res = await fetch(
          `/api/backlink-check?website=${encodeURIComponent(d)}`
        );
        const json = await res.json();

        if (!res.ok) {
          setError(json.error || "조회에 실패했습니다");
          return;
        }

        setData(json);
        trackEvent("tool_used", { tool: "backlink-checker" });
      } catch {
        setError("네트워크 오류가 발생했습니다");
      } finally {
        setLoading(false);
      }
    },
    [domain, checkAndIncrement]
  );

  return (
    <div>
      {/* 검색 폼 */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            placeholder="도메인 입력 (예: google.com)"
            className="h-12 w-full rounded-lg border bg-background pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        <button
          type="submit"
          disabled={loading || !domain.trim()}
          className="h-12 rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "백링크 확인"
          )}
        </button>
      </form>

      {/* 남은 횟수 */}
      {!isPro && (
        <p className="mt-2 text-xs text-muted-foreground">
          오늘 {remaining}회 남음
        </p>
      )}

      {/* 에러 */}
      {error && (
        <div className="mt-4 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* 로딩 스켈레톤 */}
      {loading && (
        <div className="mt-6">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-xl border bg-card p-4">
                <div className="h-4 w-20 animate-pulse rounded bg-muted" />
                <div className="mt-3 h-8 w-16 animate-pulse rounded bg-muted" />
              </div>
            ))}
          </div>
          <div className="mt-6 space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-16 animate-pulse rounded-lg border bg-muted/30"
              />
            ))}
          </div>
        </div>
      )}

      {/* 결과 */}
      {data && !loading && (
        <div className="mt-6">
          {/* 통계 카드 */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard
              label="총 백링크"
              value={data.counts?.backlinks?.total ?? 0}
              icon={LinkIcon}
              loading={false}
            />
            <StatCard
              label="DoFollow"
              value={data.counts?.backlinks?.doFollow ?? 0}
              icon={ShieldCheck}
              loading={false}
            />
            <StatCard
              label="참조 도메인"
              value={data.counts?.domains?.total ?? 0}
              icon={Globe}
              loading={false}
            />
            <StatCard
              label="DoFollow 도메인"
              value={data.counts?.domains?.doFollow ?? 0}
              icon={Users}
              loading={false}
            />
          </div>

          {/* 백링크 목록 */}
          {data.backlinks && data.backlinks.length > 0 ? (
            <>
              {/* 데스크탑 테이블 */}
              <div className="mt-6 hidden overflow-x-auto rounded-lg border sm:block">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/40">
                      <th className="px-4 py-3 text-left font-semibold">
                        출처 페이지
                      </th>
                      <th className="px-4 py-3 text-left font-semibold">
                        앵커 텍스트
                      </th>
                      <th className="px-4 py-3 text-left font-semibold">
                        유형
                      </th>
                      <th className="px-4 py-3 text-left font-semibold">
                        권한 점수
                      </th>
                      <th className="px-4 py-3 text-left font-semibold">
                        발견일
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {data.backlinks.map((bl, i) => (
                      <tr key={i} className="hover:bg-muted/20">
                        <td className="max-w-[280px] px-4 py-3">
                          <a
                            href={bl.url_from}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-primary hover:underline"
                            title={bl.url_from}
                          >
                            <span className="truncate">
                              {truncateUrl(bl.url_from)}
                            </span>
                            <ExternalLink className="h-3 w-3 shrink-0" />
                          </a>
                        </td>
                        <td className="max-w-[160px] truncate px-4 py-3 text-muted-foreground">
                          {bl.anchor || "-"}
                        </td>
                        <td className="px-4 py-3">
                          {bl.nofollow ? (
                            <span className="inline-block rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700 dark:bg-red-900/40 dark:text-red-400">
                              NoFollow
                            </span>
                          ) : (
                            <span className="inline-block rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/40 dark:text-green-400">
                              DoFollow
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-16 overflow-hidden rounded-full bg-muted">
                              <div
                                className="h-full rounded-full bg-primary"
                                style={{
                                  width: `${Math.min(100, bl.domain_inlink_rank)}%`,
                                }}
                              />
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {bl.domain_inlink_rank}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                          {bl.first_seen || "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* 모바일 카드 */}
              <div className="mt-6 space-y-3 sm:hidden">
                {data.backlinks.map((bl, i) => (
                  <div key={i} className="rounded-lg border p-4">
                    <a
                      href={bl.url_from}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                      title={bl.url_from}
                    >
                      <span className="truncate max-w-[250px]">
                        {truncateUrl(bl.url_from, 40)}
                      </span>
                      <ExternalLink className="h-3 w-3 shrink-0" />
                    </a>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      {bl.nofollow ? (
                        <span className="inline-block rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700 dark:bg-red-900/40 dark:text-red-400">
                          NoFollow
                        </span>
                      ) : (
                        <span className="inline-block rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/40 dark:text-green-400">
                          DoFollow
                        </span>
                      )}
                      <span className="text-xs text-muted-foreground">
                        권한 {bl.domain_inlink_rank}
                      </span>
                      {bl.first_seen && (
                        <span className="text-xs text-muted-foreground">
                          {bl.first_seen}
                        </span>
                      )}
                    </div>
                    {bl.anchor && (
                      <p className="mt-1 truncate text-xs text-muted-foreground">
                        앵커: {bl.anchor}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </>
          ) : (
            !data.error && (
              <div className="mt-6 rounded-lg border p-6 text-center text-sm text-muted-foreground">
                백링크 데이터가 없습니다. 새로운 도메인이거나 백링크가 아직
                수집되지 않았을 수 있습니다.
              </div>
            )
          )}

          {/* Free 사용자 잠금 CTA */}
          {data.truncated && (
            <div className="mt-4 rounded-xl border border-primary/20 bg-primary/5 p-6 text-center">
              <Lock className="mx-auto h-6 w-6 text-primary mb-2" />
              <p className="font-semibold">
                전체 {data.totalBacklinks}개 백링크 중 5개만 표시됩니다
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Pro 구독으로 모든 백링크를 확인하세요
              </p>
              <Link href="/pricing">
                <button className="mt-3 inline-flex h-10 items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
                  Pro 업그레이드
                </button>
              </Link>
            </div>
          )}
        </div>
      )}

      <UpgradeModal
        open={showUpgrade}
        onClose={() => setShowUpgrade(false)}
        title="일일 사용 한도 도달"
        description="오늘의 백링크 확인 사용 횟수를 모두 사용했습니다. Pro로 무제한 사용하세요."
      />
    </div>
  );
}
