import type { Metadata } from "next";
import Link from "next/link";
import { TrendingUp, Search, Trophy, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getRecentlySearched, getPopularDomains, getTodayHighlights } from "@/lib/db/analytics";
import { formatPrice } from "@/lib/utils";
import { HeroSection } from "@/components/home/hero-section";
import { FeaturesSection } from "@/components/home/features-section";
import { CtaSection } from "@/components/home/cta-section";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "DomainPulse — 무료 도메인 지수 체크 | DA/DR/TF 분석",
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
    title: "DomainPulse — 무료 도메인 지수 체크",
    description: "도메인명만 입력하면 DA, DR, TF, Whois, 거래 이력을 즉시 무료 분석",
    type: "website",
  },
};

export default async function HomePage() {
  let recentlySearched: Awaited<ReturnType<typeof getRecentlySearched>> = [];
  let popularDomains: Awaited<ReturnType<typeof getPopularDomains>> = [];
  let highlights: Awaited<ReturnType<typeof getTodayHighlights>> = [];

  try {
    recentlySearched = await getRecentlySearched(10);
  } catch {
    recentlySearched = [];
  }

  try {
    popularDomains = await getPopularDomains(10);
  } catch {
    popularDomains = [];
  }

  try {
    highlights = await getTodayHighlights(5);
  } catch {
    highlights = [];
  }

  return (
    <div className="flex flex-col">
      <HeroSection />
      <FeaturesSection />

      {/* 최근 검색 도메인 */}
      <section className="border-b px-4 py-16">
        <div className="mx-auto max-w-5xl">
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                <Search className="h-4 w-4 text-primary" />
              </div>
              <h2 className="text-xl font-semibold">최근 검색 도메인</h2>
            </div>
          </div>
          {recentlySearched.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {recentlySearched.map((domain) => {
                const metrics = Array.isArray(domain.domain_metrics)
                  ? domain.domain_metrics[0]
                  : domain.domain_metrics;
                return (
                  <Link key={domain.id} href={`/domain/${domain.name}`}>
                    <Card className="group border-border/60 transition-all hover:border-primary/30 hover:shadow-md hover:shadow-primary/5">
                      <CardContent className="flex items-center justify-between p-5">
                        <span className="text-sm font-medium group-hover:text-primary transition-colors">
                          {domain.name}
                        </span>
                        <div className="flex gap-1.5">
                          {metrics?.moz_da != null && (
                            <Badge variant="secondary" className="rounded-md text-xs font-normal">
                              DA {metrics.moz_da}
                            </Badge>
                          )}
                          {metrics?.ahrefs_dr != null && (
                            <Badge variant="secondary" className="rounded-md text-xs font-normal">
                              DR {metrics.ahrefs_dr}
                            </Badge>
                          )}
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
