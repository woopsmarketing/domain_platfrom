"use client";

import { useState, useEffect } from "react";
import { formatNumber, formatPrice } from "@/lib/utils";

interface TldStat {
  tld: string;
  domainCount: number;
  salesCount: number;
  avgPrice: number;
  maxPrice: number;
}

export function TldStats() {
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
