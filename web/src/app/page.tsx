import type { Metadata } from "next";
import Link from "next/link";
import { TrendingUp, Trophy, ArrowRight, BarChart3, Clock, History, TrendingUp as TrendingUpAlt } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getPopularDomains, getTodayHighlights } from "@/lib/db/analytics";
import { formatPrice } from "@/lib/utils";
import { HeroSection } from "@/components/home/hero-section";
import { CtaSection } from "@/components/home/cta-section";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "도메인체커 — 무료 도메인 지수 체크 | DA/DR/TF 분석",
  description:
    "무료 도메인 DA 체크, DR 확인, Trust Flow 분석. 도메인명만 입력하면 SEO 지수, Whois, 거래 이력을 즉시 확인. 도메인 투자자를 위한 무료 분석 도구.",
  keywords: [
    "무료 도메인 DA 체크",
    "도메인 품질 검사",
    "도메인 지수 확인",
    "Domain Authority 체크",
    "DR 확인",
    "도메인 SEO 분석",
    "도메인 거래 이력",
    "Whois 조회",
    "도메인 가치 평가",
    "만료 도메인 분석",
  ],
  openGraph: {
    title: "도메인체커 — 무료 도메인 지수 체크",
    description: "도메인명만 입력하면 DA, DR, TF, Whois, 거래 이력을 즉시 무료 분석",
    type: "website",
    siteName: "도메인체커",
  },
};

const serviceFeatures = [
  {
    icon: BarChart3,
    title: "3대 SEO 지수",
    description: "Moz DA·PA, Ahrefs DR·백링크, Majestic TF·CF를 한 화면에서 비교",
  },
  {
    icon: Clock,
    title: "7일 자동 캐시",
    description: "한 번 분석한 도메인은 7일간 즉시 로딩. 반복 조회도 빠르게",
  },
  {
    icon: History,
    title: "Wayback 히스토리",
    description: "인터넷 아카이브의 스냅샷 이력으로 도메인 과거 이력 추적",
  },
  {
    icon: TrendingUpAlt,
    title: "낙찰 이력 DB",
    description: "GoDaddy·Namecheap 경매 낙찰 데이터로 도메인 시세 파악",
  },
];

export default async function HomePage() {
  let popularDomains: Awaited<ReturnType<typeof getPopularDomains>> = [];
  let highlights: Awaited<ReturnType<typeof getTodayHighlights>> = [];

  try {
    popularDomains = await getPopularDomains(10);
  } catch {
    popularDomains = [];
  }

  try {
    highlights = await getTodayHighlights(10);
  } catch {
    highlights = [];
  }

  return (
    <div className="flex flex-col">
      <HeroSection />

      {/* ServiceIntroSection */}
      <section className="border-b bg-muted/30 px-4 py-20">
        <div className="mx-auto max-w-5xl text-center">
          <h2 className="text-3xl font-bold">도메인 투자, 데이터로 결정하세요</h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            도메인체커는 Moz, Ahrefs, Majestic 3대 SEO 지수를 한 번에 무료로 제공합니다.
            도메인명만 입력하면 DA, DR, Trust Flow, 거래 이력, Wayback 아카이브까지 즉시 확인.
          </p>

          <div className="mt-12 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {serviceFeatures.map((feature) => (
              <Card key={feature.title} className="border-border/60 text-left">
                <CardContent className="p-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <feature.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="mt-4 font-semibold">{feature.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-12 flex justify-center gap-12 border-t pt-10">
            <div>
              <p className="text-3xl font-bold">3개</p>
              <p className="mt-1 text-sm text-muted-foreground">연동 SEO 툴</p>
            </div>
            <div>
              <p className="text-3xl font-bold">무료</p>
              <p className="mt-1 text-sm text-muted-foreground">완전 무료 서비스</p>
            </div>
            <div>
              <p className="text-3xl font-bold">즉시</p>
              <p className="mt-1 text-sm text-muted-foreground">실시간 분석</p>
            </div>
          </div>
        </div>
      </section>

      {/* 인기 검색 도메인 TOP 10 */}
      <section className="border-b px-4 py-16">
        <div className="mx-auto max-w-5xl">
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                <TrendingUp className="h-4 w-4 text-primary" />
              </div>
              <h2 className="text-xl font-semibold">인기 검색 도메인 TOP 10</h2>
            </div>
          </div>
          {popularDomains.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {popularDomains.map((domain, index) => {
                const metrics = Array.isArray(domain.domain_metrics)
                  ? domain.domain_metrics[0]
                  : domain.domain_metrics;
                return (
                  <Link key={domain.id} href={`/domain/${domain.name}`}>
                    <Card className="group border-border/60 transition-all hover:border-primary/30 hover:shadow-md hover:shadow-primary/5">
                      <CardContent className="p-5">
                        <div className="flex items-center gap-2.5">
                          <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                            index < 3
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground"
                          }`}>
                            {index + 1}
                          </span>
                          <span className="truncate text-sm font-medium group-hover:text-primary transition-colors">
                            {domain.name}
                          </span>
                        </div>
                        <div className="mt-3 flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">
                            {domain.search_count}회
                          </span>
                          <div className="flex gap-1">
                            {metrics?.moz_da != null && (
                              <Badge variant="secondary" className="rounded-md text-xs font-normal">
                                DA {metrics.moz_da}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          ) : (
            <Card className="border-border/60 border-dashed">
              <CardContent className="py-12 text-center text-sm text-muted-foreground">
                아직 데이터가 없습니다. 도메인을 검색해 보세요.
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      {/* 낙찰 하이라이트 */}
      <section className="border-b px-4 py-16">
        <div className="mx-auto max-w-5xl">
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                <Trophy className="h-4 w-4 text-primary" />
              </div>
              <h2 className="text-xl font-semibold">낙찰 하이라이트</h2>
            </div>
            <Link
              href="/market-history"
              className="flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-primary"
            >
              전체 보기 <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          {highlights.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {highlights.map((sale) => (
                  <Link key={sale.id} href={`/domain/${sale.domains.name}`}>
                    <Card className="group border-border/60 transition-all hover:border-primary/30 hover:shadow-md hover:shadow-primary/5">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium group-hover:text-primary transition-colors">
                          {sale.domains.name}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="flex items-center justify-between">
                        <span className="text-xl font-bold text-primary">
                          {formatPrice(sale.price_usd)}
                        </span>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Badge variant="outline" className="rounded-md border-border/60 font-normal">
                            {sale.platform}
                          </Badge>
                          <span>{new Date(sale.sold_at).toLocaleDateString("ko-KR")}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
              ))}
            </div>
          ) : (
            <Card className="border-border/60 border-dashed">
              <CardContent className="py-12 text-center text-sm text-muted-foreground">
                아직 데이터가 없습니다.
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      <CtaSection />
    </div>
  );
}
