"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { X, ArrowRight, Globe, Calendar, Camera } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate, formatNumber } from "@/lib/utils";
import type { DomainDetail } from "@/types/domain";

interface DomainQuickSummaryProps {
  domain: string;
  onClose: () => void;
}

function MetricCell({
  value,
  label,
  sub,
}: {
  value: number | null;
  label: string;
  sub: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-lg bg-muted/50 p-3">
      <span className="text-2xl font-bold text-foreground">
        {value !== null && value !== undefined ? value : "—"}
      </span>
      <span className="text-xs font-medium text-foreground/80">{label}</span>
      <span className="text-[10px] text-muted-foreground">{sub}</span>
    </div>
  );
}

export function DomainQuickSummary({
  domain,
  onClose,
}: DomainQuickSummaryProps) {
  const [data, setData] = useState<DomainDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    setData(null);

    fetch(`/api/domain/${encodeURIComponent(domain)}`)
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error || `요청 실패 (${res.status})`);
        }
        return res.json();
      })
      .then((json) => {
        if (!cancelled) setData(json.data as DomainDetail);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message ?? "알 수 없는 오류");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [domain]);

  return (
    <div className="animate-in fade-in slide-in-from-top-2 duration-300 mt-4">
      <Card className="relative overflow-hidden border-border/60 shadow-lg">
        {/* 닫기 버튼 */}
        <button
          onClick={onClose}
          className="absolute right-3 top-3 z-10 rounded-full p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="닫기"
        >
          <X className="h-4 w-4" />
        </button>

        <CardContent className="p-5">
          {/* 로딩 */}
          {loading && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Globe className="h-5 w-5 animate-pulse text-primary" />
                <span className="text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground">{domain}</span>
                  {" "}분석중...
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-20 animate-pulse rounded-lg bg-muted/50"
                  />
                ))}
              </div>
            </div>
          )}

          {/* 에러 */}
          {error && (
            <div className="flex flex-col items-center gap-2 py-4 text-center">
              <p className="text-sm text-destructive">{error}</p>
              <Button variant="outline" size="sm" onClick={onClose}>
                닫기
              </Button>
            </div>
          )}

          {/* 결과 */}
          {data && !loading && (
            <div className="space-y-4">
              {/* 헤더 */}
              <div className="flex items-center gap-3 pr-8">
                <Globe className="h-5 w-5 shrink-0 text-primary" />
                <h3 className="truncate text-lg font-bold text-foreground">
                  {data.domain.name}
                </h3>
                <Badge
                  variant={
                    data.domain.status === "active"
                      ? "default"
                      : data.domain.status === "sold"
                        ? "secondary"
                        : "destructive"
                  }
                  className="shrink-0 text-xs"
                >
                  {data.domain.status === "active"
                    ? "활성"
                    : data.domain.status === "sold"
                      ? "판매됨"
                      : "만료"}
                </Badge>
              </div>

              {/* 지표 그리드 */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <MetricCell
                  value={data.metrics?.mozDA ?? null}
                  label="DA"
                  sub="Moz DA"
                />
                <MetricCell
                  value={data.metrics?.ahrefsDR ?? null}
                  label="DR"
                  sub="Ahrefs DR"
                />
                <MetricCell
                  value={data.metrics?.majesticTF ?? null}
                  label="TF"
                  sub="Majestic TF"
                />
                <MetricCell
                  value={data.metrics?.mozSpam ?? null}
                  label="Spam"
                  sub="Spam Score"
                />
              </div>

              {/* Wayback 요약 (있으면) */}
              {data.wayback && (data.wayback.totalSnapshots > 0 || data.wayback.totalSnapshots === -1) && (
                <div className="flex items-start gap-2 rounded-lg bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
                  <Camera className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  <span>
                    Wayback: 총{" "}
                    <span className="font-semibold text-foreground">
                      {data.wayback.totalSnapshots === -1 ? "10,000+" : formatNumber(data.wayback.totalSnapshots)}
                    </span>
                    개 스냅샷
                    {data.wayback.firstSnapshotAt && (
                      <>
                        {" · "}
                        <Calendar className="inline h-3 w-3" />{" "}
                        {formatDate(data.wayback.firstSnapshotAt)}
                      </>
                    )}
                    {data.wayback.lastSnapshotAt && (
                      <>
                        {" ~ "}
                        {formatDate(data.wayback.lastSnapshotAt)}
                      </>
                    )}
                  </span>
                </div>
              )}

              {/* 전체 분석 링크 */}
              <div className="flex justify-center pt-1">
                <Button asChild variant="outline" size="sm" className="gap-1">
                  <Link href={`/domain/${domain}`}>
                    전체 분석 보기
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
