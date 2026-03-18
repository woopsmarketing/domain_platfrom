import type { Metadata } from "next";
import { ArrowLeft, ExternalLink, Calendar, Server, Shield, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatPrice, formatDate } from "@/lib/utils";
import { getDomainByName, ensureDomainInDb } from "@/lib/db/domains";
import { incrementSearchCount } from "@/lib/db/analytics";
import { fetchDomainMetrics } from "@/lib/external/rapidapi";
import { fetchWhois } from "@/lib/external/whois";
import { fetchWayback } from "@/lib/external/wayback";
import { saveWaybackToDb } from "@/lib/db/wayback";
import { calculateDomainGrade, calculateDomainAge, checkSpamScore } from "@/lib/domain-utils";
import { Row, MetricBlock } from "@/components/domain/detail-helpers";
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

export default async function DomainDetailPage({ params }: PageProps) {
  const { name } = await params;

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
    const [freshMetrics, freshWayback, whois] = await Promise.all([
      needsMetrics ? fetchDomainMetrics(domainId, name) : Promise.resolve(null),
      needsWayback ? fetchWayback(domainId, name) : Promise.resolve(null),
      fetchWhois(name),
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
      whois,
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

      {/* Spam Score Warning */}
      {(() => {
        const spam = checkSpamScore(data.metrics?.mozSpam ?? null);
        if (spam.level === "warning" || spam.level === "danger") {
          return (
            <div
              className={`mb-6 flex items-start gap-3 rounded-lg border px-4 py-3 ${
                spam.level === "danger"
                  ? "border-red-300 bg-red-50 text-red-800"
                  : "border-yellow-300 bg-yellow-50 text-yellow-800"
              }`}
            >
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
              <div>
                <p className="font-semibold">스팸 점수 {spam.label}</p>
                <p className="text-sm">{spam.description}</p>
              </div>
            </div>
          );
        }
        return null;
      })()}

      {/* Domain Grade Badge */}
      {(() => {
        const grade = calculateDomainGrade(data.metrics);
        return (
          <Card className="mb-6">
            <CardContent className="flex items-center gap-4 py-4">
              <div
                className={`flex h-14 w-14 items-center justify-center rounded-lg border-2 text-2xl font-extrabold ${grade.color}`}
              >
                {grade.grade}
              </div>
              <div>
                <p className="text-sm text-muted-foreground">종합 등급</p>
                <p className={`text-lg font-bold ${grade.color}`}>
                  {grade.score}점 · {grade.label}
                </p>
              </div>
            </CardContent>
          </Card>
        );
      })()}

      <div className="grid gap-6 md:grid-cols-2">
        {/* 1. Whois */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Shield className="h-4 w-4" /> Whois 정보
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {data.whois ? (
              <>
                <Row label="레지스트라" value={data.whois.registrar} />
                <Row label="등록일" value={data.whois.createdDate} />
                <Row label="만료일" value={data.whois.expiresDate} />
                <Row label="수정일" value={data.whois.updatedDate} />
                <Row label="네임서버" value={data.whois.nameServers.join(", ")} />
                <Row label="상태" value={data.whois.status.join(", ")} />
                {(() => {
                  const age = calculateDomainAge(data.whois?.createdDate);
                  if (!age) return null;
                  return <Row label="도메인 나이" value={age.label} />;
                })()}
              </>
            ) : (
              <p className="text-muted-foreground">Whois 정보를 불러올 수 없습니다.</p>
            )}
          </CardContent>
        </Card>

        {/* 2. SEO Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">SEO 지수</CardTitle>
          </CardHeader>
          <CardContent>
            {data.metrics ? (
              <div className="grid grid-cols-2 gap-4">
                <MetricBlock title="Moz" items={[
                  { label: "DA", value: data.metrics.mozDA },
                  { label: "Spam Score", value: data.metrics.mozSpam },
                ]} />
                <MetricBlock title="Ahrefs" items={[
                  { label: "DR", value: data.metrics.ahrefsDR },
                  { label: "트래픽", value: data.metrics.ahrefsTraffic },
                  { label: "백링크", value: data.metrics.ahrefsBacklinks },
                  { label: "트래픽 가치", value: data.metrics.ahrefsTrafficValue, prefix: "$" },
                ]} />
                <MetricBlock title="Majestic" items={[
                  { label: "TF", value: data.metrics.majesticTF },
                  { label: "CF", value: data.metrics.majesticCF },
                ]} />
                <div className="text-xs text-muted-foreground">
                  마지막 업데이트: {formatDate(data.metrics.updatedAt)}
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">SEO 데이터 없음</p>
            )}
          </CardContent>
        </Card>

        {/* 3. Sales History */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Calendar className="h-4 w-4" /> 거래 이력
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.salesHistory.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>날짜</TableHead>
                    <TableHead>가격</TableHead>
                    <TableHead>플랫폼</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.salesHistory.map((sale) => (
                    <TableRow key={sale.id}>
                      <TableCell>{sale.soldAt}</TableCell>
                      <TableCell className="font-medium">{formatPrice(sale.priceUsd)}</TableCell>
                      <TableCell>{sale.platform}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-sm text-muted-foreground">거래 이력이 없습니다.</p>
            )}
          </CardContent>
        </Card>

        {/* 4. Wayback */}
        <Card className="md:col-span-2">
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
