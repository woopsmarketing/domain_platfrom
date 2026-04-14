"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import {
  Search,
  Loader2,
  Lock,
  ExternalLink,
  Globe,
  Hash,
  ChevronDown,
  ChevronUp,
  Star,
} from "lucide-react";
import { useRateLimit } from "@/hooks/use-rate-limit";
import { UpgradeModal } from "@/components/ui/upgrade-modal";
import { trackEvent } from "@/lib/gtag";

/* ---------- types ---------- */
interface OrganicItem {
  pos: number;
  posOverall: number;
  title: string;
  url: string;
  urlShown: string;
  desc: string;
  faviconText: string;
  rating: number | null;
}

interface RelatedQuestion {
  question: string;
  answer: string | null;
}

interface SerpData {
  query: string;
  totalResults: number;
  organic: OrganicItem[];
  relatedSearches: string[];
  relatedQuestions: RelatedQuestion[];
  aiOverview: string | null;
  truncated?: boolean;
}

/* ---------- locale / device options ---------- */
const LOCALE_OPTIONS = [
  { value: "ko-KR", label: "한국 (ko-KR)" },
  { value: "en-US", label: "미국 (en-US)" },
  { value: "ja-JP", label: "일본 (ja-JP)" },
  { value: "en-GB", label: "영국 (en-GB)" },
];

const DEVICE_OPTIONS = [
  { value: "desktop_chrome", label: "데스크탑" },
  { value: "mobile_android", label: "모바일" },
  { value: "tablet", label: "태블릿" },
];

/* ---------- helpers ---------- */
function formatNumber(n: number): string {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

/* ---------- component ---------- */
export function SerpCheckerClient() {
  const [keyword, setKeyword] = useState("");
  const [locale, setLocale] = useState("ko-KR");
  const [device, setDevice] = useState("desktop_chrome");
  const [data, setData] = useState<SerpData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aiOpen, setAiOpen] = useState(false);

  const { checkAndIncrement, showUpgrade, setShowUpgrade, isPro, remaining } =
    useRateLimit("serp_check", 2);

  const handleSearch = useCallback(
    async (q?: string) => {
      const query = q ?? keyword;
      if (!query.trim()) return;
      if (!checkAndIncrement()) return;

      setLoading(true);
      setError(null);
      setData(null);
      if (q) setKeyword(q);

      try {
        const res = await fetch(
          `/api/serp-check?q=${encodeURIComponent(query.trim())}&locale=${locale}&device=${device}`
        );
        const json = await res.json();

        if (!res.ok) {
          setError(json.error || "조회에 실패했습니다");
          return;
        }

        setData(json);
        trackEvent("tool_used", { tool: "serp-checker" });
      } catch {
        setError("네트워크 오류가 발생했습니다");
      } finally {
        setLoading(false);
      }
    },
    [keyword, locale, device, checkAndIncrement]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch();
  };

  return (
    <div>
      {/* ---------- 검색 폼 ---------- */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="검색 키워드를 입력하세요 (예: 도메인 분석)"
              className="h-12 w-full rounded-lg border bg-background pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !keyword.trim()}
            className="h-12 shrink-0 rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "검색 순위 확인"
            )}
          </button>
        </div>

        {/* 옵션 */}
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-muted-foreground" />
            <select
              value={locale}
              onChange={(e) => setLocale(e.target.value)}
              className="h-9 rounded-md border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              {LOCALE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <Hash className="h-4 w-4 text-muted-foreground" />
            <select
              value={device}
              onChange={(e) => setDevice(e.target.value)}
              className="h-9 rounded-md border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              {DEVICE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </form>

      {/* 남은 횟수 */}
      {!isPro && (
        <p className="mt-2 text-xs text-muted-foreground">
          오늘 {remaining}회 남음
        </p>
      )}

      {/* ---------- 에러 ---------- */}
      {error && (
        <div className="mt-4 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* ---------- 로딩 스켈레톤 ---------- */}
      {loading && (
        <div className="mt-6 space-y-3">
          <div className="h-12 animate-pulse rounded-lg bg-muted/30" />
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-24 animate-pulse rounded-lg border bg-muted/30"
            />
          ))}
        </div>
      )}

      {/* ---------- 결과 ---------- */}
      {data && !loading && (
        <div className="mt-6 space-y-6">
          {/* 상단 요약 */}
          <div className="rounded-xl border bg-card p-5">
            <h2 className="text-lg font-bold">
              &lsquo;{data.query}&rsquo; 검색 결과
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              총 검색 결과 약{" "}
              <span className="font-semibold text-foreground">
                {formatNumber(data.totalResults)}
              </span>
              개
            </p>

            {/* AI 개요 */}
            {data.aiOverview && (
              <div className="mt-4">
                <button
                  onClick={() => setAiOpen(!aiOpen)}
                  className="flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                >
                  <Star className="h-4 w-4" />
                  AI 개요
                  {aiOpen ? (
                    <ChevronUp className="h-3 w-3" />
                  ) : (
                    <ChevronDown className="h-3 w-3" />
                  )}
                </button>
                {aiOpen && (
                  <p className="mt-2 rounded-lg bg-primary/5 p-4 text-sm text-muted-foreground leading-relaxed">
                    {data.aiOverview}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* 검색 순위 리스트 */}
          <div className="space-y-3">
            {data.organic.map((item) => (
              <div
                key={item.pos}
                className="flex gap-4 rounded-lg border p-4 transition-colors hover:bg-accent/50"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-lg font-bold text-primary">
                  {item.pos}
                </div>
                <div className="min-w-0 flex-1">
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-medium text-foreground hover:text-primary line-clamp-1"
                  >
                    {item.title}
                    <ExternalLink className="h-3 w-3 shrink-0 opacity-50" />
                  </a>
                  <p className="mt-0.5 truncate text-xs text-emerald-600">
                    {item.urlShown}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                    {item.desc}
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    {item.faviconText && (
                      <span className="inline-block rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                        {item.faviconText}
                      </span>
                    )}
                    {item.rating && (
                      <span className="inline-flex items-center gap-1 text-xs text-amber-600">
                        <Star className="h-3 w-3 fill-current" />
                        {item.rating}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Free 사용자 잠금 CTA */}
          {data.truncated && (
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-6 text-center">
              <Lock className="mx-auto mb-2 h-6 w-6 text-primary" />
              <p className="font-semibold">상위 5개 결과만 표시됩니다</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Pro 구독으로 전체 검색 결과를 확인하세요
              </p>
              <Link href="/pricing">
                <button className="mt-3 inline-flex h-10 items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
                  Pro 업그레이드
                </button>
              </Link>
            </div>
          )}

          {/* 연관 검색어 */}
          {data.relatedSearches.length > 0 && (
            <div>
              <h3 className="mb-3 text-sm font-semibold text-muted-foreground">
                연관 검색어
              </h3>
              <div className="flex flex-wrap gap-2">
                {data.relatedSearches.map((term) => (
                  <button
                    key={term}
                    onClick={() => handleSearch(term)}
                    className="rounded-full border bg-muted/50 px-3 py-1.5 text-sm transition-colors hover:border-primary/40 hover:bg-primary/10 hover:text-primary"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 관련 질문 */}
          {data.relatedQuestions.length > 0 && (
            <div>
              <h3 className="mb-3 text-sm font-semibold text-muted-foreground">
                관련 질문
              </h3>
              <div className="divide-y rounded-lg border">
                {data.relatedQuestions.map((item, i) => (
                  <details key={i} className="group">
                    <summary className="flex cursor-pointer items-center justify-between px-4 py-3 text-sm font-medium hover:bg-muted/50">
                      {item.question}
                    </summary>
                    {item.answer && (
                      <div className="px-4 pb-3 text-sm text-muted-foreground">
                        {item.answer}
                      </div>
                    )}
                  </details>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ---------- UpgradeModal ---------- */}
      <UpgradeModal
        open={showUpgrade}
        onClose={() => setShowUpgrade(false)}
        title="일일 사용 한도 도달"
        description="오늘의 검색 순위 확인 사용 횟수를 모두 사용했습니다. Pro로 무제한 사용하세요."
      />
    </div>
  );
}
