import type { Metadata } from "next";
import { redirect, notFound } from "next/navigation";
import { headers } from "next/headers";
import { ArrowLeft, ExternalLink, Server, Gem, CheckCircle2, Send, TrendingUp } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate, formatPrice } from "@/lib/utils";
import { getDomainByName, ensureDomainInDb } from "@/lib/db/domains";
import { incrementSearchCount } from "@/lib/db/analytics";
import { fetchDomainMetrics } from "@/lib/external/rapidapi";
import { fetchWayback } from "@/lib/external/wayback";
import { saveWaybackToDb } from "@/lib/db/wayback";
import { SeoMetricsCards } from "@/components/domain/seo-metrics-cards";
import { ShareButton } from "@/components/domain/share-button";
import { FavoriteButton } from "@/components/domain/favorite-button";
import type { DomainDetail } from "@/types/domain";
import { isStale } from "@/lib/cache";
import { checkApiRateLimit } from "@/lib/rate-limit";

function isBotUA(ua: string): boolean {
  if (/bot|crawler|spider|scraper|headless|python-requests|curl|wget|go-http/i.test(ua)) return true;
  return false;
}

interface PageProps {
  params: Promise<{ name: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { name } = await params;
  const ogTitle = `${name} 도메인 분석 — 도메인체커`;
  const ogDescription = `${name}의 DA, DR, Trust Flow, Whois, 거래 이력을 무료로 확인하세요.`;
  return {
    title: `${name} 도메인 분석 — DA, DR, Whois, 거래 이력`,
    description: `${name} 도메인의 DA, DR, Trust Flow, Whois 정보, 거래 이력을 무료로 확인하세요. 도메인 품질 검사 및 SEO 지수 분석.`,
    robots: {
      index: false,
      follow: false,
    },
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      type: "website",
      siteName: "도메인체커",
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

  // 봇/헤드리스 브라우저 차단 — RapidAPI 과다호출 방지
  const headersList = await headers();
  const ua = headersList.get("user-agent") ?? "";
  if (isBotUA(ua)) notFound();

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

    // 3. 갱신 필요 여부 판단 (14일 캐시)
    let needsMetrics = !dbData?.metrics || isStale(dbData.metrics.updatedAt);
    const needsWayback = !dbData?.wayback;

    // 3.5. RapidAPI rate limit 체크 (IP당 일 5회)
    let rateLimitReached = false;
    if (needsMetrics) {
      try {
        const rl = await checkApiRateLimit("domain-metrics", 5);
        if (!rl.allowed) {
          needsMetrics = false;
          rateLimitReached = true;
        }
      } catch {
        needsMetrics = false;
      }
    }

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

    // 5.5. 로그인 사용자면 분석 이력 기록
    try {
      const { createClient } = await import("@/lib/supabase/server");
      const authClient = await createClient();
      const { data: { user } } = await authClient.auth.getUser();
      if (user) {
        const { createServiceClient } = await import("@/lib/supabase");
        const svc = createServiceClient();
        await svc.from("user_searches").insert({
          user_id: user.id,
          domain_name: name,
        });
      }
    } catch { /* 비로그인 시 무시 */ }

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
      rateLimitReached,
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
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold break-all">{name}</h1>
            <ShareButton />
            <FavoriteButton domainName={name} />
          </div>
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

      {/* SEO Metrics — 3 Cards (Pro 전용 지표 잠금 적용) */}
      {data.metrics ? (
        <SeoMetricsCards metrics={data.metrics} />
      ) : (
        <Card className="mb-6">
          <CardContent className="py-6">
            {data.rateLimitReached ? (
              <div className="text-center space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  오늘 무료 분석 한도(5회)를 모두 사용했습니다.
                </p>
                <p className="text-xs text-muted-foreground">
                  내일 다시 시도하거나, 이미 분석된 도메인은 계속 조회할 수 있습니다.
                </p>
              </div>
            ) : (
              <p className="text-center text-sm text-muted-foreground">SEO 데이터를 불러오는 중이거나 아직 수집되지 않았습니다.</p>
            )}
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
                  <p className="text-xl font-bold">{data.wayback.totalSnapshots === -1 ? "10,000+" : data.wayback.totalSnapshots}</p>
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

      {/* Marketplace Recommendation Banner */}
      <Card className="mt-6 border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
        <CardContent className="py-6 px-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <Gem className="h-5 w-5 text-primary shrink-0" />
                <p className="font-semibold text-base">
                  더 높은 DA의 프리미엄 도메인을 찾고 계신가요?
                </p>
              </div>
              <p className="text-sm text-muted-foreground">
                SEO 지표가 검증된 100개 이상의 프리미엄 도메인을 합리적 가격에 만나보세요.
              </p>
              <ul className="flex flex-col gap-1">
                {[
                  "DA 25~50 검증 도메인",
                  "10년+ 이력 보유",
                  "백링크 프로필 사전 분석 완료",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="shrink-0">
              <Link href="/marketplace">
                <Button variant="default" className="w-full sm:w-auto whitespace-nowrap">
                  프리미엄 도메인 둘러보기 →
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* SEO 대행 — 텔레그램 상담 CTA */}
      <Card className="mt-6 border-emerald-500/30 bg-gradient-to-r from-emerald-500/5 to-teal-500/10">
        <CardContent className="py-6 px-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-emerald-600 shrink-0" />
                <p className="font-semibold text-base">
                  구글 상위노출 실행사 SEO
                </p>
              </div>
              <p className="text-sm text-muted-foreground">
                블랙키워드 · 고난이도 키워드 전문 9년차 — 노출 보장형 실행사 SEO를 직접 상담받아보세요.
              </p>
              <ul className="flex flex-col gap-1">
                {[
                  "블랙키워드 / 고난이도 키워드 전문 9년차",
                  "도메인 + 콘텐츠 + 백링크 풀패키지 운영",
                  "실시간 순위 트래킹 + 보장형 계약 가능",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="shrink-0">
              <a
                href="https://t.me/GOAT82"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  variant="default"
                  className="w-full sm:w-auto whitespace-nowrap bg-emerald-600 hover:bg-emerald-700"
                >
                  <Send className="h-4 w-4" />
                  텔레그램으로 상담받기
                </Button>
              </a>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
