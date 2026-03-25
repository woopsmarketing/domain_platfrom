"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { formatNumber } from "@/lib/utils";
import { calculateDomainGrade, GRADE_BG_MAP } from "@/lib/domain-utils";
import { cleanDomain } from "@/lib/clean-domain";
import type { DomainDetail } from "@/types/domain";

export function BulkAnalysis() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<DomainDetail[]>([]);

  const analyze = useCallback(async () => {
    const domains = input
      .split("\n")
      .map((d) => cleanDomain(d))
      .filter((d) => d.length > 0 && d.includes("."));

    if (domains.length === 0) return;

    const unique = [...new Set(domains)].slice(0, 10);
    setLoading(true);
    setResults([]);

    try {
      const settled = await Promise.allSettled(
        unique.map((d) =>
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
  }, [input]);

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
        placeholder={"도메인을 한 줄에 하나씩 입력하세요 (최대 10개)\nexample.com\ntest.io"}
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />

      <Button
        className="h-12 px-8 text-base"
        onClick={analyze}
        disabled={loading || input.trim().length === 0}
      >
        {loading ? "분석 중..." : "분석 시작"}
      </Button>

      {results.length > 0 && (
        <>
          {/* 데스크탑 테이블 */}
          <div className="hidden overflow-x-auto rounded-lg border sm:block">
            <table className="w-full text-sm" style={{ minWidth: "1200px" }}>
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="sticky left-0 z-10 bg-muted/30 px-4 py-1 text-left" rowSpan={2}></th>
                  <th className="px-2 py-1 text-center" rowSpan={2}></th>
                  <th className="border-l border-border/40 px-2 py-1 text-center text-xs font-semibold text-blue-600" colSpan={4}>Moz</th>
                  <th className="border-l border-border/40 px-2 py-1 text-center text-xs font-semibold text-orange-600" colSpan={6}>Ahrefs</th>
                  <th className="border-l border-border/40 px-2 py-1 text-center text-xs font-semibold text-purple-600" colSpan={4}>Majestic</th>
                  <th className="border-l border-border/40 px-2 py-1 text-center text-xs font-semibold text-green-600" rowSpan={2}>Wayback</th>
                </tr>
                <tr className="border-b bg-muted/50">
                  <th className="border-l border-border/40 px-2 py-2 text-right text-xs font-medium">DA</th>
                  <th className="px-2 py-2 text-right text-xs font-medium">PA</th>
                  <th className="px-2 py-2 text-right text-xs font-medium">Links</th>
                  <th className="px-2 py-2 text-right text-xs font-medium">Spam</th>
                  <th className="border-l border-border/40 px-2 py-2 text-right text-xs font-medium">DR</th>
                  <th className="px-2 py-2 text-right text-xs font-medium">백링크</th>
                  <th className="px-2 py-2 text-right text-xs font-medium">참조도메인</th>
                  <th className="px-2 py-2 text-right text-xs font-medium">트래픽</th>
                  <th className="px-2 py-2 text-right text-xs font-medium">가치($)</th>
                  <th className="px-2 py-2 text-right text-xs font-medium">키워드</th>
                  <th className="border-l border-border/40 px-2 py-2 text-right text-xs font-medium">TF</th>
                  <th className="px-2 py-2 text-right text-xs font-medium">CF</th>
                  <th className="px-2 py-2 text-right text-xs font-medium">Links</th>
                  <th className="px-2 py-2 text-right text-xs font-medium">참조도메인</th>
                </tr>
              </thead>
              <tbody>
                {results.map((detail) => {
                  const m = detail.metrics;
                  const wb = detail.wayback;
                  return (
                    <tr key={detail.domain.name} className="border-b last:border-0 hover:bg-muted/20">
                      <td className="sticky left-0 z-10 bg-card px-4 py-2.5">
                        <a href={`/domain/${detail.domain.name}`} target="_blank" rel="noopener noreferrer" className="text-primary underline-offset-4 hover:underline text-xs font-medium">
                          {detail.domain.name}
                        </a>
                      </td>
                      <td className="px-2 py-2.5 text-center">{gradeCircle(detail)}</td>
                      {/* Moz */}
                      <td className="border-l border-border/20 px-2 py-2.5 text-right tabular-nums text-xs">{m?.mozDA ?? "-"}</td>
                      <td className="px-2 py-2.5 text-right tabular-nums text-xs">{m?.mozPA ?? "-"}</td>
                      <td className="px-2 py-2.5 text-right tabular-nums text-xs">{m?.mozLinks != null ? formatNumber(m.mozLinks) : "-"}</td>
                      <td className="px-2 py-2.5 text-right tabular-nums text-xs">{m?.mozSpam != null ? `${m.mozSpam}%` : "-"}</td>
                      {/* Ahrefs */}
                      <td className="border-l border-border/20 px-2 py-2.5 text-right tabular-nums text-xs">{m?.ahrefsDR ?? "-"}</td>
                      <td className="px-2 py-2.5 text-right tabular-nums text-xs">{m?.ahrefsBacklinks != null ? formatNumber(m.ahrefsBacklinks) : "-"}</td>
                      <td className="px-2 py-2.5 text-right tabular-nums text-xs">{m?.ahrefsRefDomains != null ? formatNumber(m.ahrefsRefDomains) : "-"}</td>
                      <td className="px-2 py-2.5 text-right tabular-nums text-xs">{m?.ahrefsTraffic != null ? formatNumber(m.ahrefsTraffic) : "-"}</td>
                      <td className="px-2 py-2.5 text-right tabular-nums text-xs">{m?.ahrefsTrafficValue != null ? formatNumber(m.ahrefsTrafficValue) : "-"}</td>
                      <td className="px-2 py-2.5 text-right tabular-nums text-xs">{m?.ahrefsOrganicKeywords != null ? formatNumber(m.ahrefsOrganicKeywords) : "-"}</td>
                      {/* Majestic */}
                      <td className="border-l border-border/20 px-2 py-2.5 text-right tabular-nums text-xs">{m?.majesticTF ?? "-"}</td>
                      <td className="px-2 py-2.5 text-right tabular-nums text-xs">{m?.majesticCF ?? "-"}</td>
                      <td className="px-2 py-2.5 text-right tabular-nums text-xs">{m?.majesticLinks != null ? formatNumber(m.majesticLinks) : "-"}</td>
                      <td className="px-2 py-2.5 text-right tabular-nums text-xs">{m?.majesticRefDomains != null ? formatNumber(m.majesticRefDomains) : "-"}</td>
                      {/* Wayback */}
                      <td className="border-l border-border/20 px-2 py-2.5 text-right tabular-nums text-xs">{wb?.totalSnapshots != null ? formatNumber(wb.totalSnapshots) : "-"}</td>
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
                  <div className="mt-3 grid grid-cols-4 gap-2 text-center">
                    <div><p className="text-xs text-muted-foreground">DA</p><p className="text-sm font-semibold">{m?.mozDA ?? "-"}</p></div>
                    <div><p className="text-xs text-muted-foreground">DR</p><p className="text-sm font-semibold">{m?.ahrefsDR ?? "-"}</p></div>
                    <div><p className="text-xs text-muted-foreground">TF</p><p className="text-sm font-semibold">{m?.majesticTF ?? "-"}</p></div>
                    <div><p className="text-xs text-muted-foreground">CF</p><p className="text-sm font-semibold">{m?.majesticCF ?? "-"}</p></div>
                  </div>
                  <div className="mt-2 grid grid-cols-3 gap-2 text-center">
                    <div><p className="text-xs text-muted-foreground">백링크</p><p className="text-xs font-semibold">{m?.ahrefsBacklinks != null ? formatNumber(m.ahrefsBacklinks) : "-"}</p></div>
                    <div><p className="text-xs text-muted-foreground">트래픽</p><p className="text-xs font-semibold">{m?.ahrefsTraffic != null ? formatNumber(m.ahrefsTraffic) : "-"}</p></div>
                    <div><p className="text-xs text-muted-foreground">스팸</p><p className="text-xs font-semibold">{m?.mozSpam != null ? `${m.mozSpam}%` : "-"}</p></div>
                  </div>
                </a>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
