"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Lock, AlertTriangle } from "lucide-react";
import { formatNumber } from "@/lib/utils";
import { calculateDomainGrade, GRADE_BG_MAP } from "@/lib/domain-utils";
import { cleanDomain } from "@/lib/clean-domain";
import type { DomainDetail } from "@/types/domain";
import { useRateLimit } from "@/hooks/use-rate-limit";
import { UpgradeModal } from "@/components/ui/upgrade-modal";

export function BulkAnalysis() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<DomainDetail[]>([]);
  const [trimWarning, setTrimWarning] = useState("");
  const { checkAndIncrement, showUpgrade, setShowUpgrade, isPro, remaining } = useRateLimit("bulk_analysis", 1);

  const maxDomains = isPro ? 100 : 5;

  const analyze = useCallback(async () => {
    if (!checkAndIncrement()) return;
    setTrimWarning("");

    const domains = input
      .split("\n")
      .map((d) => cleanDomain(d))
      .filter((d) => d.length > 0 && d.includes("."));

    if (domains.length === 0) return;

    const unique = [...new Set(domains)];

    if (unique.length > maxDomains) {
      setTrimWarning(
        isPro
          ? `Pro 사용자는 최대 ${maxDomains}개까지 분석 가능합니다. 처음 ${maxDomains}개만 분석합니다.`
          : `Free 사용자는 최대 ${maxDomains}개까지 분석 가능합니다. 처음 ${maxDomains}개만 분석합니다. Pro 구독으로 최대 100개까지 분석하세요.`
      );
    }

    const toAnalyze = unique.slice(0, maxDomains);

    setLoading(true);
    setResults([]);

    try {
      const settled = await Promise.allSettled(
        toAnalyze.map((d) =>
          fetch(`/api/domain/${encodeURIComponent(d)}`).then(async (r) => {
            if (!r.ok) throw new Error(`${d} failed`);
            const json = await r.json();
            return json.data as DomainDetail;
          })
        )
      );

      const fulfilled = settled
        .filter((r): r is PromiseFulfilledResult<DomainDetail> => r.status === "fulfilled")
        .map((r) => r.value);

      setResults(fulfilled);
    } finally {
      setLoading(false);
    }
  }, [input, checkAndIncrement, maxDomains, isPro]);

  const gradeCircle = (detail: DomainDetail) => {
    const g = calculateDomainGrade(detail.metrics);
    return (
      <span
        className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-white ${GRADE_BG_MAP[g.grade]}`}
      >
        {g.grade}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <textarea
        className="h-40 w-full rounded-lg border border-input bg-transparent px-4 py-3 text-base placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        placeholder={`도메인을 한 줄에 하나씩 입력하세요 (${isPro ? "Pro: 최대 100개" : "무료: 최대 5개, 1일 1회"})\nexample.com\ntest.io`}
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />

      {trimWarning && (
        <div className="flex items-start gap-2 rounded-lg border border-yellow-500/30 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-700 dark:text-yellow-400">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{trimWarning}</span>
        </div>
      )}

      <div className="flex items-center gap-3">
        <Button
          className="h-12 px-8 text-base"
          onClick={analyze}
          disabled={loading || input.trim().length === 0}
        >
          {loading ? "분석 중..." : "분석 시작"}
        </Button>
        {!isPro && <span className="text-xs text-muted-foreground">오늘 {remaining}회 남음</span>}
      </div>

      {results.length > 0 && (
        <>
          {/* 데스크탑 테이블 */}
          <div className="hidden overflow-x-auto rounded-lg border sm:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="sticky left-0 z-10 bg-muted/50 px-4 py-3 text-left font-medium">도메인</th>
                  <th className="px-3 py-3 text-center font-medium">등급</th>
                  <th className="px-3 py-3 text-right font-medium">DA</th>
                  <th className="px-3 py-3 text-right font-medium">PA</th>
                  <th className="px-3 py-3 text-right font-medium">DR</th>
                  <th className="px-3 py-3 text-right font-medium">TF</th>
                  <th className="px-3 py-3 text-right font-medium">CF</th>
                  <th className="px-3 py-3 text-right font-medium">백링크</th>
                  <th className="px-3 py-3 text-right font-medium">참조도메인</th>
                  <th className="px-3 py-3 text-right font-medium">Wayback</th>
                </tr>
              </thead>
              <tbody>
                {results.map((detail) => {
                  const m = detail.metrics;
                  const wb = detail.wayback;
                  return (
                    <tr key={detail.domain.name} className="border-b last:border-0 hover:bg-muted/20">
                      <td className="sticky left-0 z-10 bg-card px-4 py-3">
                        <a href={`/domain/${detail.domain.name}`} target="_blank" rel="noopener noreferrer" className="text-primary underline-offset-4 hover:underline font-medium">
                          {detail.domain.name}
                        </a>
                      </td>
                      <td className="px-3 py-3 text-center">{gradeCircle(detail)}</td>
                      <td className="px-3 py-3 text-right tabular-nums">{m?.mozDA ?? "-"}</td>
                      <td className="px-3 py-3 text-right tabular-nums">{m?.mozPA ?? "-"}</td>
                      <td className="px-3 py-3 text-right tabular-nums">{m?.ahrefsDR ?? "-"}</td>
                      <td className="px-3 py-3 text-right tabular-nums">{m?.majesticTF ?? "-"}</td>
                      <td className="px-3 py-3 text-right tabular-nums">{m?.majesticCF ?? "-"}</td>
                      <td className="px-3 py-3 text-right tabular-nums">{m?.ahrefsBacklinks != null ? formatNumber(m.ahrefsBacklinks) : "-"}</td>
                      <td className="px-3 py-3 text-right tabular-nums">{m?.ahrefsRefDomains != null ? formatNumber(m.ahrefsRefDomains) : "-"}</td>
                      <td className="px-3 py-3 text-right tabular-nums">{wb?.totalSnapshots != null ? formatNumber(wb.totalSnapshots) : "-"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* 모바일 카드 뷰 */}
          <div className="space-y-3 sm:hidden">
            {results.map((detail) => {
              const m = detail.metrics;
              const wb = detail.wayback;
              return (
                <a
                  key={detail.domain.name}
                  href={`/domain/${detail.domain.name}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block rounded-xl border border-border/60 p-4 transition-colors hover:bg-muted/30"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-primary truncate mr-2">
                      {detail.domain.name}
                    </span>
                    {gradeCircle(detail)}
                  </div>
                  <div className="mt-3 grid grid-cols-5 gap-2 text-center">
                    <div><p className="text-xs text-muted-foreground">DA</p><p className="text-sm font-semibold">{m?.mozDA ?? "-"}</p></div>
                    <div><p className="text-xs text-muted-foreground">PA</p><p className="text-sm font-semibold">{m?.mozPA ?? "-"}</p></div>
                    <div><p className="text-xs text-muted-foreground">DR</p><p className="text-sm font-semibold">{m?.ahrefsDR ?? "-"}</p></div>
                    <div><p className="text-xs text-muted-foreground">TF</p><p className="text-sm font-semibold">{m?.majesticTF ?? "-"}</p></div>
                    <div><p className="text-xs text-muted-foreground">CF</p><p className="text-sm font-semibold">{m?.majesticCF ?? "-"}</p></div>
                  </div>
                  <div className="mt-2 grid grid-cols-3 gap-2 text-center">
                    <div><p className="text-xs text-muted-foreground">백링크</p><p className="text-xs font-semibold">{m?.ahrefsBacklinks != null ? formatNumber(m.ahrefsBacklinks) : "-"}</p></div>
                    <div><p className="text-xs text-muted-foreground">참조도메인</p><p className="text-xs font-semibold">{m?.ahrefsRefDomains != null ? formatNumber(m.ahrefsRefDomains) : "-"}</p></div>
                    <div><p className="text-xs text-muted-foreground">Wayback</p><p className="text-xs font-semibold">{wb?.totalSnapshots != null ? formatNumber(wb.totalSnapshots) : "-"}</p></div>
                  </div>
                </a>
              );
            })}
          </div>
          {/* Pro 안내 */}
          <Link href="/pricing" className="mt-4 block rounded-xl border border-primary/20 bg-gradient-to-r from-primary/5 to-blue-500/5 p-4 transition-colors hover:border-primary/40">
            <div className="flex items-start gap-3">
              <Lock className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <div>
                <p className="text-sm font-semibold">Pro 업그레이드로 더 많은 지표를 확인하세요</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Pro 구독 시 다음 지표를 추가로 확인할 수 있습니다:
                  월간 트래픽, 트래픽 가치($), 오가닉 키워드 수, Moz Links, 스팸 점수, Majestic Links, Majestic 참조 도메인
                </p>
              </div>
            </div>
          </Link>
        </>
      )}

      <UpgradeModal
        open={showUpgrade}
        onClose={() => setShowUpgrade(false)}
        title="일일 사용 한도 도달"
        description="오늘의 대량 분석 사용 횟수를 모두 사용했습니다. Pro로 무제한 사용하세요."
      />
    </div>
  );
}
