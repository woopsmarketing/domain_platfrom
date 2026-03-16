import type { Metadata } from "next";
import Link from "next/link";
import { TrendingUp, Search, Trophy } from "lucide-react";
import { DomainSearchBox } from "@/components/domain/domain-search-box";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getRecentlySearched, getPopularDomains, getTodayHighlights } from "@/lib/db/analytics";
import { formatPrice } from "@/lib/utils";

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
      {/* Hero — 검색 중심 */}
      <section className="border-b bg-gradient-to-b from-background to-muted/30 px-4 py-24 sm:py-40">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            도메인 지수를 <span className="text-primary">무료</span>로 확인하세요
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            도메인명만 입력하면 DA, DR, Trust Flow, Whois, 거래 이력을 즉시 분석합니다.
          </p>

          <div className="mt-8">
            <DomainSearchBox />
          </div>

          <p className="mt-3 text-sm text-muted-foreground">
            예시: theverge.com, github.com, shopify.com
          </p>
        </div>
      </section>

      {/* 최근 검색 도메인 (A2) */}
      <section className="border-b px-4 py-16">
        <div className="mx-auto max-w-5xl">
          <div className="mb-6 flex items-center gap-2">
            <Search className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-bold">최근 검색 도메인</h2>
          </div>
          {recentlySearched.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {recentlySearched.map((domain) => {
                const metrics = Array.isArray(domain.domain_metrics)
                  ? domain.domain_metrics[0]
                  : domain.domain_metrics;
                return (
                  <Link key={domain.id} href={`/domain/${domain.name}`}>
                    <Card className="transition-colors hover:border-primary/50">
                      <CardContent className="flex items-center justify-between p-5">
                        <span className="text-base font-medium">{domain.name}</span>
                        <div className="flex gap-1.5">
                          {metrics?.moz_da != null && (
                            <Badge variant="secondary" className="text-xs">
                              DA {metrics.moz_da}
                            </Badge>
                          )}
                          {metrics?.ahrefs_dr != null && (
                            <Badge variant="secondary" className="text-xs">
                              DR {metrics.ahrefs_dr}
                            </Badge>
                          )}
                          {metrics?.majestic_tf != null && (
                            <Badge variant="secondary" className="text-xs">
                              TF {metrics.majestic_tf}
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
            <Card>
              <CardContent className="py-8 text-center text-sm text-muted-foreground">
                아직 데이터가 없습니다. 도메인을 검색해 보세요.
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      {/* 인기 검색 도메인 TOP 10 (D1) */}
      <section className="border-b px-4 py-16">
        <div className="mx-auto max-w-5xl">
          <div className="mb-6 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-bold">인기 검색 도메인 TOP 10</h2>
          </div>
          {popularDomains.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {popularDomains.map((domain, index) => {
                const metrics = Array.isArray(domain.domain_metrics)
                  ? domain.domain_metrics[0]
                  : domain.domain_metrics;
                return (
                  <Link key={domain.id} href={`/domain/${domain.name}`}>
                    <Card className="transition-colors hover:border-primary/50">
                      <CardContent className="p-5">
                        <div className="flex items-center gap-2">
                          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                            {index + 1}
                          </span>
                          <span className="truncate text-base font-medium">{domain.name}</span>
                        </div>
                        <div className="mt-2.5 flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">
                            검색 {domain.search_count}회
                          </span>
                          <div className="flex gap-1">
                            {metrics?.moz_da != null && (
                              <Badge variant="secondary" className="text-xs">
                                DA {metrics.moz_da}
                              </Badge>
                            )}
                            {metrics?.ahrefs_dr != null && (
                              <Badge variant="secondary" className="text-xs">
                                DR {metrics.ahrefs_dr}
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
            <Card>
              <CardContent className="py-8 text-center text-sm text-muted-foreground">
                아직 데이터가 없습니다. 도메인을 검색해 보세요.
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      {/* 낙찰 하이라이트 (D2) */}
      <section className="border-b px-4 py-16">
        <div className="mx-auto max-w-5xl">
          <div className="mb-6 flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-bold">낙찰 하이라이트</h2>
          </div>
          {highlights.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {highlights.map((sale) => {
                const domain = sale.domains as unknown as { id: string; name: string; tld: string; source: string };
                return (
                  <Link key={sale.id} href={`/domain/${domain.name}`}>
                    <Card className="transition-colors hover:border-primary/50">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">{domain.name}</CardTitle>
                      </CardHeader>
                      <CardContent className="flex items-center justify-between">
                        <span className="text-lg font-bold text-primary">
                          {formatPrice(sale.price_usd)}
                        </span>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Badge variant="outline">{sale.platform}</Badge>
                          <span>{new Date(sale.sold_at).toLocaleDateString("ko-KR")}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="py-8 text-center text-sm text-muted-foreground">
                아직 데이터가 없습니다.
              </CardContent>
            </Card>
          )}
        </div>
      </section>

    </div>
  );
}
