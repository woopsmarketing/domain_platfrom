import type { Metadata } from "next";
import Link from "next/link";
import { TrendingUp, Search, Trophy, ArrowRight, BarChart3, Shield, Zap } from "lucide-react";
import { DomainSearchBox } from "@/components/domain/domain-search-box";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getRecentlySearched, getPopularDomains, getTodayHighlights } from "@/lib/db/analytics";
import { formatPrice } from "@/lib/utils";

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
      {/* Hero */}
      <section className="relative overflow-hidden border-b px-4 py-24 sm:py-32 lg:py-40">
        {/* Background decoration */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-primary/[0.03] via-transparent to-transparent" />
        <div className="pointer-events-none absolute -left-40 -top-40 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -right-40 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />

        <div className="relative mx-auto max-w-3xl text-center">
          <Badge variant="secondary" className="mb-6 rounded-full px-4 py-1.5 text-sm font-medium">
            완전 무료 — 회원가입 없이 즉시 사용
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            도메인 지수를
            <br />
            <span className="bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
              무료로 분석하세요
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
            도메인명만 입력하면 DA, DR, Trust Flow, Whois, 거래 이력을 즉시 분석합니다.
          </p>

          <div className="mt-10">
            <DomainSearchBox />
          </div>

          <div className="mt-4 flex items-center justify-center gap-4 text-sm text-muted-foreground">
            <span>예시:</span>
            {["theverge.com", "github.com", "shopify.com"].map((d) => (
              <Link
                key={d}
                href={`/domain/${d}`}
                className="rounded-md border border-border/60 px-2.5 py-1 transition-colors hover:border-primary/40 hover:text-foreground"
              >
                {d}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Feature highlights */}
      <section className="border-b px-4 py-16">
        <div className="mx-auto grid max-w-5xl gap-6 sm:grid-cols-3">
          {[
            { icon: BarChart3, title: "SEO 지표 분석", desc: "DA, DR, TF, CF 백링크, 트래픽을 한눈에" },
            { icon: Shield, title: "스팸 점수 경고", desc: "위험 도메인을 사전에 식별하여 안전한 투자" },
            { icon: Zap, title: "즉시 분석 결과", desc: "검색 즉시 7일 캐시 기반 빠른 응답" },
          ].map((f) => (
            <div key={f.title} className="flex items-start gap-4 rounded-xl border border-border/60 bg-card p-6">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <f.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">{f.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

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
              {highlights.map((sale) => {
                const domain = sale.domains as unknown as { id: string; name: string; tld: string; source: string };
                return (
                  <Link key={sale.id} href={`/domain/${domain.name}`}>
                    <Card className="group border-border/60 transition-all hover:border-primary/30 hover:shadow-md hover:shadow-primary/5">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium group-hover:text-primary transition-colors">
                          {domain.name}
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
                );
              })}
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

      {/* CTA */}
      <section className="px-4 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-bold sm:text-3xl">
            지금 바로 도메인을 분석해 보세요
          </h2>
          <p className="mt-3 text-muted-foreground">
            완전 무료, 회원가입 없이 즉시 사용 가능합니다.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link href="/tools">
              <Badge variant="secondary" className="cursor-pointer rounded-full px-4 py-2 text-sm transition-colors hover:bg-primary hover:text-primary-foreground">
                벌크 분석 도구
              </Badge>
            </Link>
            <Link href="/market-history">
              <Badge variant="secondary" className="cursor-pointer rounded-full px-4 py-2 text-sm transition-colors hover:bg-primary hover:text-primary-foreground">
                낙찰 이력 검색
              </Badge>
            </Link>
            <Link href="/blog">
              <Badge variant="secondary" className="cursor-pointer rounded-full px-4 py-2 text-sm transition-colors hover:bg-primary hover:text-primary-foreground">
                도메인 투자 가이드
              </Badge>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
