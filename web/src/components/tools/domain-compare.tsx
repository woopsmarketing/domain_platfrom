"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock } from "lucide-react";
import { formatNumber } from "@/lib/utils";
import { calculateDomainGrade, calculateDomainAge, GRADE_BG_MAP } from "@/lib/domain-utils";
import { cleanDomain } from "@/lib/clean-domain";
import type { DomainDetail } from "@/types/domain";
import { useRateLimit } from "@/hooks/use-rate-limit";
import { UpgradeModal } from "@/components/ui/upgrade-modal";

export function DomainCompare() {
  const [domains, setDomains] = useState<string[]>(["", ""]);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<DomainDetail[]>([]);
  const { checkAndIncrement, showUpgrade, setShowUpgrade, isPro, remaining } = useRateLimit("domain_compare", 5);

  const updateDomain = (index: number, value: string) => {
    setDomains((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const addDomain = () => {
    if (domains.length < 3) setDomains((prev) => [...prev, ""]);
  };

  const removeDomain = (index: number) => {
    if (domains.length > 2) {
      setDomains((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const compare = useCallback(async () => {
    if (!checkAndIncrement()) return;
    const valid = domains
      .map((d) => cleanDomain(d))
      .filter((d) => d.length > 0 && d.includes("."));

    if (valid.length < 2) return;

    setLoading(true);
    setResults([]);

    try {
      const settled = await Promise.allSettled(
        valid.map((d) =>
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
  }, [domains, checkAndIncrement]);

  const findWinner = (
    values: (number | null | undefined)[],
    lower = false
  ): number => {
    let best = -1;
    let bestVal = lower ? Infinity : -Infinity;
    values.forEach((v, i) => {
      if (v == null) return;
      if (lower ? v < bestVal : v > bestVal) {
        bestVal = v;
        best = i;
      }
    });
    return best;
  };

  type MetricRow = {
    label: string;
    values: (string | number)[];
    winner: number;
  };

  const buildRows = (): MetricRow[] => {
    if (results.length < 2) return [];

    const metrics = results.map((r) => r.metrics);
    const whois = results.map((r) => r.whois);

    const waybacks = results.map((r) => r.wayback);

    // 무료 지표
    const freeRows: MetricRow[] = [
      { label: "DA (Domain Authority)", values: metrics.map((m) => m?.mozDA ?? "-"), winner: findWinner(metrics.map((m) => m?.mozDA)) },
      { label: "PA (Page Authority)", values: metrics.map((m) => m?.mozPA ?? "-"), winner: findWinner(metrics.map((m) => m?.mozPA)) },
      { label: "DR (Domain Rating)", values: metrics.map((m) => m?.ahrefsDR ?? "-"), winner: findWinner(metrics.map((m) => m?.ahrefsDR)) },
      { label: "TF (Trust Flow)", values: metrics.map((m) => m?.majesticTF ?? "-"), winner: findWinner(metrics.map((m) => m?.majesticTF)) },
      { label: "CF (Citation Flow)", values: metrics.map((m) => m?.majesticCF ?? "-"), winner: findWinner(metrics.map((m) => m?.majesticCF)) },
      { label: "백링크", values: metrics.map((m) => m?.ahrefsBacklinks != null ? formatNumber(m.ahrefsBacklinks) : "-"), winner: findWinner(metrics.map((m) => m?.ahrefsBacklinks)) },
      { label: "참조 도메인", values: metrics.map((m) => m?.ahrefsRefDomains != null ? formatNumber(m.ahrefsRefDomains) : "-"), winner: findWinner(metrics.map((m) => m?.ahrefsRefDomains)) },
      {
        label: "도메인 연령",
        values: whois.map((w) => { const age = calculateDomainAge(w?.createdDate); return age?.label ?? "-"; }),
        winner: findWinner(whois.map((w) => { const age = calculateDomainAge(w?.createdDate); return age?.totalDays ?? null; })),
      },
      { label: "Wayback 스냅샷", values: waybacks.map((w) => w?.totalSnapshots != null ? formatNumber(w.totalSnapshots) : "-"), winner: findWinner(waybacks.map((w) => w?.totalSnapshots)) },
    ];

    return freeRows;
  };

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        {domains.map((d, i) => (
          <div key={i} className="flex items-center gap-3">
            <Input
              className="h-12 text-base"
              placeholder={`도메인 ${i + 1} (예: example.com)`}
              value={d}
              onChange={(e) => updateDomain(i, e.target.value)}
            />
            {domains.length > 2 && (
              <Button
                variant="ghost"
                size="icon"
                className="h-12 w-12 shrink-0"
                onClick={() => removeDomain(i)}
              >
                &times;
              </Button>
            )}
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {domains.length < 3 && (
          <Button variant="outline" className="h-12 px-8 text-base" onClick={addDomain}>
            도메인 추가
          </Button>
        )}
        <Button
          className="h-12 px-8 text-base"
          onClick={compare}
          disabled={loading || domains.filter((d) => d.trim().includes(".")).length < 2}
        >
          {loading ? "비교 중..." : "비교하기"}
        </Button>
        {!isPro && <span className="text-xs text-muted-foreground">오늘 {remaining}회 남음</span>}
      </div>

      {results.length >= 2 && (
        <>
          {/* Grade cards */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            {results.map((detail) => {
              const g = calculateDomainGrade(detail.metrics);
              return (
                <Card key={detail.domain.name}>
                  <CardHeader className="items-center pb-2">
                    <span
                      className={`flex h-14 w-14 items-center justify-center rounded-full text-xl font-bold text-white ${GRADE_BG_MAP[g.grade]}`}
                    >
                      {g.grade}
                    </span>
                  </CardHeader>
                  <CardContent className="text-center">
                    <CardTitle className="text-base">{detail.domain.name}</CardTitle>
                    <p className={`mt-1 text-sm ${g.color}`}>
                      {g.label} ({g.score}점)
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Comparison table */}
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-3 text-left font-medium">지표</th>
                  {results.map((r) => (
                    <th key={r.domain.name} className="px-4 py-3 text-right font-medium">
                      {r.domain.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {buildRows().map((row) => (
                  <tr key={row.label} className="border-b last:border-0">
                    <td className="px-4 py-3 font-medium">{row.label}</td>
                    {row.values.map((val, i) => (
                      <td
                        key={i}
                        className={`px-4 py-3 text-right tabular-nums ${
                          i === row.winner ? "font-semibold text-green-600" : ""
                        }`}
                      >
                        <span className="inline-flex items-center gap-1">
                          {val}
                          {i === row.winner && <span title="Winner">🏆</span>}
                        </span>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pro 안내 */}
          <Link href="/pricing" className="mt-4 block rounded-xl border border-primary/20 bg-gradient-to-r from-primary/5 to-blue-500/5 p-4 transition-colors hover:border-primary/40">
            <div className="flex items-start gap-3">
              <Lock className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <div>
                <p className="text-sm font-semibold">Pro 업그레이드로 더 많은 지표를 비교하세요</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Pro 구독 시 다음 지표를 추가로 비교할 수 있습니다:
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
        description="오늘의 도메인 비교 사용 횟수를 모두 사용했습니다. Pro로 무제한 사용하세요."
      />
    </div>
  );
}
