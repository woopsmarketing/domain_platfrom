"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatNumber, formatPrice } from "@/lib/utils";
import { calculateDomainGrade, calculateDomainAge } from "@/lib/domain-utils";
import type { DomainDetail } from "@/types/domain";

/* ------------------------------------------------------------------ */
/*  Tab 1 — 벌크 분석                                                   */
/* ------------------------------------------------------------------ */

function BulkAnalysis() {
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
    const bgMap: Record<string, string> = {
      A: "bg-green-500",
      B: "bg-blue-500",
      C: "bg-yellow-500",
      D: "bg-orange-500",
      F: "bg-red-500",
    };
    return (
      <span
        className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-white ${bgMap[g.grade]}`}
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

/* ------------------------------------------------------------------ */
/*  Tab 2 — 도메인 비교                                                  */
/* ------------------------------------------------------------------ */

function DomainCompare() {
  const [domains, setDomains] = useState<string[]>(["", ""]);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<DomainDetail[]>([]);

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
    const valid = domains
      .map((d) => d.trim().toLowerCase())
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
  }, [domains]);

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

    const rows: MetricRow[] = [
      {
        label: "DA",
        values: metrics.map((m) => m?.mozDA ?? "-"),
        winner: findWinner(metrics.map((m) => m?.mozDA)),
      },
      {
        label: "DR",
        values: metrics.map((m) => m?.ahrefsDR ?? "-"),
        winner: findWinner(metrics.map((m) => m?.ahrefsDR)),
      },
      {
        label: "TF",
        values: metrics.map((m) => m?.majesticTF ?? "-"),
        winner: findWinner(metrics.map((m) => m?.majesticTF)),
      },
      {
        label: "월간 트래픽",
        values: metrics.map((m) =>
          m?.ahrefsTraffic != null ? formatNumber(m.ahrefsTraffic) : "-"
        ),
        winner: findWinner(metrics.map((m) => m?.ahrefsTraffic)),
      },
      {
        label: "백링크",
        values: metrics.map((m) =>
          m?.ahrefsBacklinks != null ? formatNumber(m.ahrefsBacklinks) : "-"
        ),
        winner: findWinner(metrics.map((m) => m?.ahrefsBacklinks)),
      },
      {
        label: "도메인 연령",
        values: whois.map((w) => {
          const age = calculateDomainAge(w?.createdDate);
          return age?.label ?? "-";
        }),
        winner: findWinner(
          whois.map((w) => {
            const age = calculateDomainAge(w?.createdDate);
            return age?.totalDays ?? null;
          })
        ),
      },
      {
        label: "스팸 점수",
        values: metrics.map((m) => (m?.mozSpam != null ? `${m.mozSpam}%` : "-")),
        winner: findWinner(
          metrics.map((m) => m?.mozSpam),
          true
        ),
      },
    ];

    return rows;
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

      <div className="flex flex-wrap gap-3">
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
      </div>

      {results.length >= 2 && (
        <>
          {/* Grade cards */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            {results.map((detail) => {
              const g = calculateDomainGrade(detail.metrics);
              const bgMap: Record<string, string> = {
                A: "bg-green-500",
                B: "bg-blue-500",
                C: "bg-yellow-500",
                D: "bg-orange-500",
                F: "bg-red-500",
              };
              return (
                <Card key={detail.domain.name}>
                  <CardHeader className="items-center pb-2">
                    <span
                      className={`flex h-14 w-14 items-center justify-center rounded-full text-xl font-bold text-white ${bgMap[g.grade]}`}
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
                        className={`px-4 py-3 text-right ${
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
        </>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 3 — TLD 통계                                                   */
/* ------------------------------------------------------------------ */

interface TldStat {
  tld: string;
  domainCount: number;
  salesCount: number;
  avgPrice: number;
  maxPrice: number;
}

function TldStats() {
  const [stats, setStats] = useState<TldStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/tld-stats")
      .then(async (r) => {
        if (!r.ok) throw new Error("Failed to load");
        const json = await r.json();
        setStats(json.data ?? []);
      })
      .catch(() => setError("데이터를 불러올 수 없습니다"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p className="py-12 text-center text-muted-foreground">데이터 로딩 중...</p>;
  }

  if (error) {
    return <p className="py-12 text-center text-red-500">{error}</p>;
  }

  if (stats.length === 0) {
    return <p className="py-12 text-center text-muted-foreground">통계 데이터가 없습니다.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="px-4 py-3 text-left font-medium">TLD</th>
            <th className="px-4 py-3 text-right font-medium">도메인 수</th>
            <th className="px-4 py-3 text-right font-medium">거래 수</th>
            <th className="px-4 py-3 text-right font-medium">평균 낙찰가</th>
            <th className="px-4 py-3 text-right font-medium">최고 낙찰가</th>
          </tr>
        </thead>
        <tbody>
          {stats.map((s) => (
            <tr key={s.tld} className="border-b last:border-0">
              <td className="px-4 py-3 font-medium">{s.tld}</td>
              <td className="px-4 py-3 text-right">{formatNumber(s.domainCount)}</td>
              <td className="px-4 py-3 text-right">{formatNumber(s.salesCount)}</td>
              <td className="px-4 py-3 text-right">
                {s.avgPrice > 0 ? formatPrice(s.avgPrice) : "-"}
              </td>
              <td className="px-4 py-3 text-right">
                {s.maxPrice > 0 ? formatPrice(s.maxPrice) : "-"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Page                                                          */
/* ------------------------------------------------------------------ */

export default function ToolsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-3xl font-bold tracking-tight">분석 도구</h1>
      <p className="mt-2 text-muted-foreground">
        도메인 벌크 분석, 비교, TLD별 통계를 확인하세요.
      </p>

      <Tabs defaultValue="bulk" className="mt-6">
        <TabsList className="h-12 w-full justify-start gap-1">
          <TabsTrigger value="bulk" className="h-10 px-6 text-base">
            벌크 분석
          </TabsTrigger>
          <TabsTrigger value="compare" className="h-10 px-6 text-base">
            도메인 비교
          </TabsTrigger>
          <TabsTrigger value="tld" className="h-10 px-6 text-base">
            TLD 통계
          </TabsTrigger>
        </TabsList>

        <TabsContent value="bulk" className="mt-6">
          <BulkAnalysis />
        </TabsContent>

        <TabsContent value="compare" className="mt-6">
          <DomainCompare />
        </TabsContent>

        <TabsContent value="tld" className="mt-6">
          <TldStats />
        </TabsContent>
      </Tabs>
    </div>
  );
}
