"use client";

import Link from "next/link";
import { Lock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { isPro } from "@/lib/subscription";
import type { DomainMetrics } from "@/types/domain";

function MetricRow({ label, value, proOnly = false }: { label: string; value: number | null; proOnly?: boolean }) {
  const locked = proOnly && !isPro();

  return (
    <div className="flex justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      {locked ? (
        <Link href="/pricing" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors">
          <Lock className="h-3 w-3" />Pro
        </Link>
      ) : (
        <span className="font-medium tabular-nums">{value !== null ? value.toLocaleString() : "—"}</span>
      )}
    </div>
  );
}

export function SeoMetricsCards({ metrics }: { metrics: DomainMetrics }) {
  return (
    <div className="mb-6 grid gap-4 sm:grid-cols-3">
      {/* Moz */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold tracking-wide text-muted-foreground">Moz</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          <MetricRow label="DA" value={metrics.mozDA} />
          <MetricRow label="PA" value={metrics.mozPA} />
          <MetricRow label="Links" value={metrics.mozLinks} proOnly />
          <MetricRow label="Spam Score" value={metrics.mozSpam} proOnly />
        </CardContent>
      </Card>

      {/* Majestic */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold tracking-wide text-muted-foreground">Majestic</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          <MetricRow label="Trust Flow" value={metrics.majesticTF} />
          <MetricRow label="Citation Flow" value={metrics.majesticCF} />
          <MetricRow label="Links" value={metrics.majesticLinks} proOnly />
          <MetricRow label="Ref Domains" value={metrics.majesticRefDomains} proOnly />
          {metrics.majesticTTF0Name && (
            <div className="mt-2 rounded bg-muted px-2 py-1 text-xs text-muted-foreground">
              주제: <span className="font-medium text-foreground">{metrics.majesticTTF0Name}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Ahrefs */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold tracking-wide text-muted-foreground">Ahrefs</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          <MetricRow label="DR" value={metrics.ahrefsDR} />
          <MetricRow label="Backlinks" value={metrics.ahrefsBacklinks} />
          <MetricRow label="Ref Domains" value={metrics.ahrefsRefDomains} />
          <MetricRow label="Traffic" value={metrics.ahrefsTraffic} proOnly />
          <MetricRow label="Traffic Value" value={metrics.ahrefsTrafficValue} proOnly />
          <MetricRow label="Keywords" value={metrics.ahrefsOrganicKeywords} proOnly />
        </CardContent>
      </Card>
    </div>
  );
}
