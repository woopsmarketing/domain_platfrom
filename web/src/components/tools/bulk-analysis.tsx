"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { formatNumber } from "@/lib/utils";
import { calculateDomainGrade, GRADE_BG_MAP } from "@/lib/domain-utils";
import type { DomainDetail } from "@/types/domain";

export function BulkAnalysis() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<DomainDetail[]>([]);

  const analyze = useCallback(async () => {
    const domains = input
      .split("\n")
      .map((d) => d.trim().toLowerCase())
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
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left font-medium">도메인</th>
                <th className="px-4 py-3 text-center font-medium">등급</th>
                <th className="px-4 py-3 text-right font-medium">DA</th>
                <th className="px-4 py-3 text-right font-medium">DR</th>
                <th className="px-4 py-3 text-right font-medium">TF</th>
                <th className="px-4 py-3 text-right font-medium">백링크</th>
                <th className="px-4 py-3 text-right font-medium">트래픽</th>
              </tr>
            </thead>
            <tbody>
              {results.map((detail) => (
                <tr key={detail.domain.name} className="border-b last:border-0">
                  <td className="px-4 py-3">
                    <Link
                      href={`/domain/${detail.domain.name}`}
                      className="text-primary underline-offset-4 hover:underline"
                    >
                      {detail.domain.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-center">{gradeCircle(detail)}</td>
                  <td className="px-4 py-3 text-right">{detail.metrics?.mozDA ?? "-"}</td>
                  <td className="px-4 py-3 text-right">{detail.metrics?.ahrefsDR ?? "-"}</td>
                  <td className="px-4 py-3 text-right">{detail.metrics?.majesticTF ?? "-"}</td>
                  <td className="px-4 py-3 text-right">
                    {detail.metrics?.ahrefsBacklinks != null
                      ? formatNumber(detail.metrics.ahrefsBacklinks)
                      : "-"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {detail.metrics?.ahrefsTraffic != null
                      ? formatNumber(detail.metrics.ahrefsTraffic)
                      : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
