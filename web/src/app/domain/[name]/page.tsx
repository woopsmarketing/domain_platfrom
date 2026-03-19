import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ArrowLeft, ExternalLink, Server } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import { getDomainByName, ensureDomainInDb } from "@/lib/db/domains";
import { incrementSearchCount } from "@/lib/db/analytics";
import { fetchDomainMetrics } from "@/lib/external/rapidapi";
import { fetchWayback } from "@/lib/external/wayback";
import { saveWaybackToDb } from "@/lib/db/wayback";
import { MetricBlock } from "@/components/domain/detail-helpers";
import type { DomainDetail } from "@/types/domain";
import { isStale } from "@/lib/cache";

interface PageProps {
  params: Promise<{ name: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { name } = await params;
  const ogTitle = `${name} 도메인 분석 — DomainPulse`;
  const ogDescription = `${name}의 DA, DR, Trust Flow, Whois, 거래 이력을 무료로 확인하세요.`;
  return {
    title: `${name} 도메인 분석 — DA, DR, Whois, 거래 이력`,
    description: `${name} 도메인의 DA, DR, Trust Flow, Whois 정보, 거래 이력을 무료로 확인하세요. 도메인 품질 검사 및 SEO 지수 분석.`,
    keywords: [
      `${name} 도메인 분석`,
      `${name} DA`,
      `${name} Whois`,
      "도메인 품질 검사",
      "무료 도메인 지수",
    ],
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      type: "website",
      siteName: "DomainPulse",
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description: ogDescription,
    },
  };
}

function cleanDomain(raw: string): string {
  let value = decodeURIComponent(raw).trim().toLowerCase();
  value = value.replace(/^https?:\/\//, "");
  value = value.replace(/^www\./, "");
  value = value.split("/")[0];
  value = value.split(":")[0];
  return value;
}

export default async function DomainDetailPage({ params }: PageProps) {
  const { name } = await params;

  // URL에 프로토콜/www 등이 포함된 경우 정규화 후 리다이렉트
  const cleaned = cleanDomain(name);
  if (cleaned !== name) {
    redirect(`/domain/${cleaned}`);
  }

  let data: DomainDetail | null = null;
  try {
    // 1. DB에 도메인 없으면 자동 생성
    const domainId = await ensureDomainInDb(name);

    // 2. DB에서 기존 데이터 조회
    const dbData = await getDomainByName(name);

    // 3. 갱신 필요 여부 판단 (7일 캐시)
    const needsMetrics = !dbData?.metrics || isStale(dbData.metrics.updatedAt);
    const needsWayback = !dbData?.wayback;

    // 4. 필요한 외부 API만 호출 (병렬)
    const [freshMetrics, freshWayback] = await Promise.all([
      needsMetrics ? fetchDomainMetrics(domainId, name) : Promise.resolve(null),
      needsWayback ? fetchWayback(domainId, name) : Promise.resolve(null),
    ]);

    // 5. Wayback 결과 DB 저장 + 검색 카운트 증가
    await Promise.all([
      freshWayback ? saveWaybackToDb(domainId, freshWayback) : Promise.resolve(),
      incrementSearchCount(domainId),
    ]);

    data = {
      domain: dbData?.domain ?? {
        id: domainId,
        name,
        tld: name.split(".").pop() ?? "",
        status: "active" as const,
        source: "other" as const,
        createdAt: new Date().toISOString(),
      },
      metrics: freshMetrics ?? dbData?.metrics ?? null,
      salesHistory: dbData?.salesHistory ?? [],
      wayback: freshWayback ?? dbData?.wayback ?? null,
      whois: null,
    };
  } catch {
    // DB not connected - data stays null
  }

  if (!data) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
          <p className="text-lg font-medium">도메인 정보를 불러올 수 없습니다</p>
          <p className="text-sm">{name} — 서비스 연결을 확인해주세요.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <Link href="/">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">{name}</h1>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Badge variant={data.domain.status === "sold" ? "default" : "outline"}>
              {data.domain.status === "sold" ? "낙찰" : data.domain.status === "expired" ? "만료" : "활성"}
            </Badge>
            {data.salesHistory.length > 0 && (
              <span className="font-semibold text-foreground">
                {formatPrice(data.salesHistory[0].priceUsd)}
              </span>
            )}
            <span>· {data.domain.source.toUpperCase()}</span>
          </div>
        </div>
      </div>

      {/* SEO Metrics — 3 Cards */}
      {data.metrics ? (
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          {/* Moz */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold tracking-wide text-muted-foreground">Moz</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <MetricBlock items={[
                { label: "DA", value: data.metrics.mozDA },
                { label: "PA", value: data.metrics.mozPA },
                { label: "Links", value: data.metrics.mozLinks },
                { label: "Spam Score", value: data.metrics.mozSpam },
              ]} />
            </CardContent>
          </Card>

          {/* Majestic */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold tracking-wide text-muted-foreground">Majestic</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <MetricBlock items={[
                { label: "Trust Flow", value: data.metrics.majesticTF },
                { label: "Citation Flow", value: data.metrics.majesticCF },
                { label: "Links", value: data.metrics.majesticLinks },
                { label: "Ref Domains", value: data.metrics.majesticRefDomains },
              ]} />
              {data.metrics.majesticTTF0Name && (
                <div className="mt-2 rounded bg-muted px-2 py-1 text-xs text-muted-foreground">
                  주제: <span className="font-medium text-foreground">{data.metrics.majesticTTF0Name}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Ahrefs */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold tracking-wide text-muted-foreground">Ahrefs</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <MetricBlock items={[
                { label: "DR", value: data.metrics.ahrefsDR },
                { label: "Backlinks", value: data.metrics.ahrefsBacklinks },
                { label: "Ref Domains", value: data.metrics.ahrefsRefDomains },
                { label: "Traffic", value: data.metrics.ahrefsTraffic },
                { label: "Keywords", value: data.metrics.ahrefsOrganicKeywords },
              ]} />
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card className="mb-6">
          <CardContent className="py-6">
            <p className="text-center text-sm text-muted-foreground">SEO 데이터를 불러오는 중이거나 아직 수집되지 않았습니다.</p>
          </CardContent>
        </Card>
      )}

      {data.metrics && (
        <p className="mb-6 text-right text-xs text-muted-foreground">
          마지막 업데이트: {formatDate(data.metrics.updatedAt)}
        </p>
      )}

      <div className="grid gap-6">
        {/* Wayback */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Server className="h-4 w-4" /> Wayback Machine 히스토리
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.wayback ? (
              <div className="flex flex-wrap gap-6 text-sm">
                <div>
                  <p className="text-muted-foreground">총 스냅샷</p>
                  <p className="text-xl font-bold">{data.wayback.totalSnapshots}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">첫 크롤일</p>
                  <p className="font-medium">
                    {data.wayback.firstSnapshotAt
                      ? formatDate(data.wayback.firstSnapshotAt)
                      : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">마지막 크롤일</p>
                  <p className="font-medium">
                    {data.wayback.lastSnapshotAt
                      ? formatDate(data.wayback.lastSnapshotAt)
                      : "—"}
                  </p>
                </div>
                <a
                  href={`https://web.archive.org/web/*/${name}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-primary hover:underline"
                >
                  Wayback에서 보기 <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Wayback 데이터 없음</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
