import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Clock,
  History,
  Globe,
  Search,
  Shield,
  Zap,
  Target,
  Users,
  CheckCircle2,
  ChevronDown,
  Sparkles,
  TrendingUp,
  Trophy,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getRecentlySearched, getActiveMarketplaceListings } from "@/lib/db/analytics";
import { HeroSection } from "@/components/home/hero-section";
import { CtaSection } from "@/components/home/cta-section";
import { ServiceCta } from "@/components/shared/service-cta";
import { ActiveAuctionsSection } from "@/components/home/active-auctions-section";
import { PremiumDomainsSection } from "@/components/home/premium-domains-section";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "도메인 분석 사이트 · 무료 도메인 점수 확인 · SEO 분석 도구 | 도메인체커",
  description:
    "도메인 이름만 입력하면 도메인 점수, 권한(DA/DR), 백링크, 신뢰도를 즉시 확인할 수 있는 무료 분석 사이트입니다. SEO 분석, 백링크 조회를 한 곳에서.",
  keywords: [
    "도메인 분석", "도메인 분석 사이트", "도메인 점수 확인", "무료 도메인 분석 툴",
    "도메인 권한 확인", "백링크 확인", "사이트 SEO 분석", "도메인 조회", "도메인 검색",
    "도메인 등급 확인", "도메인 신뢰도 확인", "도메인 품질 확인", "웹사이트 분석",
  ],
  openGraph: {
    title: "도메인 분석 사이트 · 무료 도메인 점수 확인 | 도메인체커",
    description: "도메인 이름만 입력하면 점수, 권한, 백링크, 신뢰도를 즉시 무료 분석",
    type: "website",
    siteName: "도메인체커",
  },
};

const faqItems = [
  { q: "도메인체커는 정말 무료인가요?", a: "네, 완전 무료입니다. 회원가입 없이 도메인 이름만 입력하면 도메인 점수, 신뢰도, 백링크 수, 과거 이력을 즉시 확인할 수 있습니다." },
  { q: "도메인 점수는 무엇인가요?", a: "도메인 점수는 해당 도메인이 검색엔진에서 얼마나 높은 순위에 오를 수 있는지를 1~100점으로 나타낸 지표입니다. 점수가 높을수록 같은 콘텐츠를 올려도 검색 상위에 노출될 가능성이 높습니다." },
  { q: "도메인을 구매하기 전에 왜 분석해야 하나요?", a: "겉보기에 괜찮은 도메인도 과거에 스팸 사이트로 사용되었거나 검색엔진 페널티를 받은 이력이 있을 수 있습니다. 구매 전에 도메인 점수, 과거 이력, 소유자 정보를 확인하면 리스크를 피할 수 있습니다." },
  { q: "도메인 이력은 어떻게 확인하나요?", a: "도메인체커에서 도메인을 검색하면 과거 웹사이트 스냅샷을 통해 어떤 콘텐츠가 있었는지 확인할 수 있습니다. 이를 통해 해당 도메인의 과거 용도와 신뢰도를 판단할 수 있습니다." },
  { q: "분석 결과는 얼마나 정확한가요?", a: "도메인체커는 글로벌 SEO 데이터베이스를 기반으로 분석합니다. 도메인 비교와 구매 판단에 충분한 참고 자료이며, 데이터는 7일마다 자동 갱신됩니다." },
  { q: "도메인 백링크는 왜 중요한가요?", a: "백링크는 다른 웹사이트에서 내 도메인으로 연결된 링크입니다. 백링크가 많고 품질이 좋을수록 검색엔진이 해당 도메인을 신뢰합니다. 도메인체커에서 백링크 수와 참조 도메인 수를 무료로 확인할 수 있습니다." },
  { q: "도메인 스팸 점수는 무엇인가요?", a: "스팸 점수는 해당 도메인이 스팸 사이트로 분류될 위험도를 나타냅니다. 중고 도메인이나 만료 도메인을 구매할 때 스팸 점수가 높으면 검색엔진 페널티를 받을 수 있으므로 반드시 확인해야 합니다." },
  { q: "만료 도메인이나 경매 도메인은 어떻게 고르나요?", a: "경매 도메인이나 만료 도메인을 고를 때는 도메인 점수, 백링크 품질, 스팸 점수, 과거 이력을 반드시 확인하세요. 도메인체커에서 이 모든 정보를 무료로 분석할 수 있고, 낙찰 이력 페이지에서 실제 거래 시세도 확인할 수 있습니다." },
];

export default async function HomePage() {
  let recentDomains: Awaited<ReturnType<typeof getRecentlySearched>> = [];
  let marketplaceListings: Awaited<ReturnType<typeof getActiveMarketplaceListings>> = [];

  try {
    recentDomains = await getRecentlySearched(12);
  } catch {
    recentDomains = [];
  }

  try {
    marketplaceListings = await getActiveMarketplaceListings(50);
  } catch {
    marketplaceListings = [];
  }

  return (
    <div className="flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faqItems.map((faq) => ({
              "@type": "Question",
              name: faq.q,
              acceptedAnswer: { "@type": "Answer", text: faq.a },
            })),
          }),
        }}
      />

      <HeroSection />

      {/* ────────────────────────────────────────────────
          최근 분석된 도메인
          ──────────────────────────────────────────────── */}
      <section className="border-b px-4 py-16">
        <div className="mx-auto max-w-5xl">
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
              <Clock className="h-4 w-4 text-primary" />
            </div>
            <h2 className="text-xl font-semibold">최근 분석된 도메인</h2>
          </div>
          {recentDomains.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {recentDomains.map((domain) => {
                const metrics = Array.isArray(domain.domain_metrics)
                  ? domain.domain_metrics[0]
                  : domain.domain_metrics;
                return (
                  <Link key={domain.id} href={`/domain/${domain.name}`}>
                    <Card className="group border-border/60 transition-all hover:border-primary/30 hover:shadow-md hover:shadow-primary/5">
                      <CardContent className="p-5">
                        <span className="truncate text-sm font-medium group-hover:text-primary transition-colors block">
                          {domain.name}
                        </span>
                        <div className="mt-3 flex items-center gap-1.5">
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
                아직 분석된 도메인이 없습니다. 도메인을 검색해 보세요.
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      <ActiveAuctionsSection />
      {/* ────────────────────────────────────────────────
          인기 프리미엄 도메인
          ──────────────────────────────────────────────── */}
      <PremiumDomainsSection listings={marketplaceListings} />

      {/* ────────────────────────────────────────────────
          Section 1: 도메인이 왜 중요한가
          ──────────────────────────────────────────────── */}
      <section className="border-b px-4 py-20 sm:py-24">
        <div className="mx-auto max-w-5xl">
          <div className="text-center">
            <Badge variant="secondary" className="mb-4 rounded-full px-3 py-1 text-xs font-medium">
              온라인 비즈니스의 시작
            </Badge>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
              도메인, 왜 신중하게 골라야 할까요?
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              도메인은 사업의 첫인상이자, SEO의 시작점입니다. 도메인 분석을 통해 점수와 백링크를 확인하고, 사이트 SEO 분석 결과를 바탕으로 신중하게 선택하세요. 좋은 도메인 하나가 브랜드 신뢰도와 매출을 좌우합니다.
            </p>
          </div>

          <div className="mt-16 grid gap-6 sm:grid-cols-3">
            <div className="relative rounded-2xl border border-border/60 bg-card p-8 transition-shadow hover:shadow-lg hover:shadow-primary/5">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10">
                <Search className="h-6 w-6 text-blue-500" />
              </div>
              <h3 className="mt-5 text-lg font-semibold">검색 노출에 직접 영향</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                검색엔진은 도메인의 나이, 평판, 백링크 수를 신뢰 지표로 봅니다. 무료 도메인 분석으로 점수를 확인하면, 같은 콘텐츠를 올려도 어떤 도메인이 더 빨리 상위에 노출되는지 판단할 수 있습니다.
              </p>
            </div>
            <div className="relative rounded-2xl border border-border/60 bg-card p-8 transition-shadow hover:shadow-lg hover:shadow-primary/5">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-500/10">
                <Shield className="h-6 w-6 text-violet-500" />
              </div>
              <h3 className="mt-5 text-lg font-semibold">브랜드 신뢰도</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                고객이 처음 접하는 것은 당신의 도메인입니다.
                깔끔하고 기억하기 쉬운 도메인은 클릭률을 높이고
                브랜드 인지도를 만듭니다.
              </p>
            </div>
            <div className="relative rounded-2xl border border-border/60 bg-card p-8 transition-shadow hover:shadow-lg hover:shadow-primary/5">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10">
                <TrendingUp className="h-6 w-6 text-emerald-500" />
              </div>
              <h3 className="mt-5 text-lg font-semibold">디지털 자산 가치</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                좋은 도메인은 해마다 가치가 올라갑니다. 점수 높은 도메인은 수천~수만 달러에 거래되며, 그 자체가 디지털 부동산입니다.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ────────────────────────────────────────────────
          Section 2: 핵심 기능 소개 (기존 ServiceIntro 업그레이드)
          ──────────────────────────────────────────────── */}
      <section className="border-b bg-muted/30 px-4 py-20 sm:py-24">
        <div className="mx-auto max-w-5xl">
          <div className="text-center">
            <Badge variant="secondary" className="mb-4 rounded-full px-3 py-1 text-xs font-medium">
              도메인체커 핵심 기능
            </Badge>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
              도메인 분석, 이제 한 곳에서
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              도메인 점수 확인, 백링크 확인, 사이트 SEO 분석을 따로 하려면 여러 유료 도구가 필요합니다. 도메인체커는 이 모든 핵심 지표를 <strong className="text-foreground">완전 무료</strong>로 제공하는 도메인 분석 도구입니다.
            </p>
          </div>

          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: BarChart3,
                title: "도메인 종합 점수",
                description: "검색 순위 점수, 신뢰도, 백링크 수를 한 화면에서 확인하고 비교",
                color: "text-blue-500 bg-blue-500/10",
              },
              {
                icon: Clock,
                title: "7일 자동 갱신",
                description: "한 번 분석한 도메인은 7일간 즉시 결과 반환. 빠르고 효율적",
                color: "text-amber-500 bg-amber-500/10",
              },
              {
                icon: History,
                title: "과거 이력 조회",
                description: "도메인이 과거에 어떤 사이트였는지 스냅샷으로 확인. 위험한 도메인을 사전에 걸러냄",
                color: "text-emerald-500 bg-emerald-500/10",
              },
              {
                icon: Trophy,
                title: "경매 낙찰 데이터",
                description: "실제 경매에서 낙찰된 도메인의 거래 가격을 수집하여 시세 파악",
                color: "text-violet-500 bg-violet-500/10",
              },
            ].map((feature) => (
              <Card key={feature.title} className="border-border/60 transition-shadow hover:shadow-lg hover:shadow-primary/5">
                <CardContent className="p-6">
                  <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${feature.color}`}>
                    <feature.icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 font-semibold">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-14 grid grid-cols-3 divide-x divide-border/60 rounded-2xl border border-border/60 bg-card py-6 sm:py-8">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary sm:text-3xl">6가지</p>
              <p className="mt-1 text-sm text-muted-foreground">핵심 분석 지표</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-primary sm:text-3xl">무료</p>
              <p className="mt-1 text-sm text-muted-foreground">완전 무료 서비스</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-primary sm:text-3xl">즉시</p>
              <p className="mt-1 text-sm text-muted-foreground">실시간 분석 결과</p>
            </div>
          </div>
        </div>
      </section>

      {/* ────────────────────────────────────────────────
          Section 3: 3단계 사용법 (How it works)
          ──────────────────────────────────────────────── */}
      <section className="border-b px-4 py-20 sm:py-24">
        <div className="mx-auto max-w-5xl">
          <div className="text-center">
            <Badge variant="secondary" className="mb-4 rounded-full px-3 py-1 text-xs font-medium">
              간단한 사용법
            </Badge>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
              3단계로 도메인을 분석하세요
            </h2>
          </div>

          <div className="mt-14 grid gap-8 sm:grid-cols-3">
            {[
              {
                step: "01",
                icon: Globe,
                title: "도메인 입력",
                description: "분석하고 싶은 도메인을 검색창에 입력합니다. URL, www 붙여도 자동으로 정리됩니다.",
              },
              {
                step: "02",
                icon: Zap,
                title: "즉시 분석",
                description: "글로벌 SEO 데이터베이스와 웹 아카이브에서 데이터를 실시간으로 수집합니다.",
              },
              {
                step: "03",
                icon: CheckCircle2,
                title: "결과 확인",
                description: "도메인 점수, 등급, 백링크 수, 신뢰도, 과거 이력까지 한 화면에서 확인하세요.",
              },
            ].map((item) => (
              <div key={item.step} className="relative text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                  <item.icon className="h-7 w-7 text-primary" />
                </div>
                <span className="mt-4 inline-block text-xs font-bold uppercase tracking-widest text-primary">
                  Step {item.step}
                </span>
                <h3 className="mt-2 text-lg font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ────────────────────────────────────────────────
          Section 4: 이런 분들에게 추천합니다
          ──────────────────────────────────────────────── */}
      <section className="border-b bg-muted/30 px-4 py-20 sm:py-24">
        <div className="mx-auto max-w-5xl">
          <div className="text-center">
            <Badge variant="secondary" className="mb-4 rounded-full px-3 py-1 text-xs font-medium">
              누구를 위한 서비스인가요
            </Badge>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
              이런 분들이 사용하고 있습니다
            </h2>
          </div>

          <div className="mt-14 grid gap-5 sm:grid-cols-2">
            {[
              {
                icon: Target,
                title: "도메인 투자자",
                points: [
                  "만료 도메인의 품질을 빠르게 판단",
                  "경매 전 도메인 점수와 이력 사전 분석",
                  "낙찰 이력으로 적정 매입가 파악",
                ],
              },
              {
                icon: Users,
                title: "스타트업 / 소규모 사업자",
                points: [
                  "사업 시작 전 도메인 품질 검증",
                  "경쟁사 도메인 SEO 지수 벤치마킹",
                  "브랜드 도메인의 Wayback 이력 확인",
                ],
              },
              {
                icon: Search,
                title: "SEO / 마케팅 담당자",
                points: [
                  "백링크 대상 도메인의 신뢰도 확인",
                  "여러 점수 지표를 한 번에 교차 검증",
                  "스팸 점수 체크로 페널티 리스크 회피",
                ],
              },
              {
                icon: Sparkles,
                title: "블로거 / 콘텐츠 크리에이터",
                points: [
                  "새 블로그 도메인 선정 시 품질 비교",
                  "게스트 포스팅 대상 사이트의 점수 확인",
                  "자신의 도메인 성장 추이 모니터링",
                ],
              },
            ].map((persona) => (
              <Card key={persona.title} className="border-border/60 transition-shadow hover:shadow-lg hover:shadow-primary/5">
                <CardContent className="p-7">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                      <persona.icon className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold">{persona.title}</h3>
                  </div>
                  <ul className="mt-4 space-y-2.5">
                    {persona.points.map((point) => (
                      <li key={point} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ────────────────────────────────────────────────
          Section 5: 도메인 선택이 중요한 이유 (SEO 콘텐츠)
          ──────────────────────────────────────────────── */}
      <section className="border-b px-4 py-20 sm:py-24">
        <div className="mx-auto max-w-5xl">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <Badge variant="secondary" className="mb-4 rounded-full px-3 py-1 text-xs font-medium">
                도메인 투자 인사이트
              </Badge>
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
                시작이 반이다
                <br />
                <span className="text-primary">좋은 도메인이 사업의 절반</span>
              </h2>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                온라인 사업에서 도메인은 가장 먼저 결정하는 것이자, 가장 오래 유지되는 자산입니다. 도메인 점수 확인 후 점수가 높은 도메인 위에 콘텐츠를 쌓으면 검색 노출이 빨라지고, 기억하기 쉬운 도메인은 직접 유입 트래픽을 만듭니다.
              </p>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                도메인체커의 무료 도메인 분석을 통해 구매 전 반드시 도메인 점수, 백링크, 신뢰도, 스팸 점수, 과거 이력을 확인하세요. 데이터 기반의 사이트 SEO 분석이 실패 확률을 줄여줍니다.
              </p>
              <div className="mt-8">
                <Link
                  href="/blog/what-is-da"
                  className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                >
                  도메인 점수란 무엇인가? <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
            <div className="space-y-4">
              {[
                { metric: "검색 순위 점수", desc: "도메인의 검색엔진 권위도. 1~100점으로 사이트의 순위 예측력을 측정" },
                { metric: "백링크 등급", desc: "다른 사이트에서 받은 링크의 강도. 양질의 백링크가 많을수록 등급이 높아짐" },
                { metric: "신뢰도 점수", desc: "링크의 품질 기반 신뢰도. 스팸이 아닌 신뢰할 수 있는 사이트에서 오는 링크를 측정" },
              ].map((item) => (
                <div key={item.metric} className="rounded-xl border border-border/60 bg-card p-5 transition-shadow hover:shadow-md">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">{item.metric}</h3>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <ServiceCta />

      {/* ────────────────────────────────────────────────
          Section 7: FAQ (SEO rich)
          ──────────────────────────────────────────────── */}
      <section className="border-b bg-muted/30 px-4 py-20 sm:py-24">
        <div className="mx-auto max-w-3xl">
          <div className="text-center">
            <Badge variant="secondary" className="mb-4 rounded-full px-3 py-1 text-xs font-medium">
              자주 묻는 질문
            </Badge>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">FAQ</h2>
          </div>

          <div className="mt-12 space-y-4">
            {faqItems.map((faq) => (
              <details key={faq.q} className="group rounded-xl border border-border/60 bg-card transition-shadow hover:shadow-md [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex cursor-pointer items-center justify-between p-5">
                  <h3 className="pr-4 text-sm font-semibold">{faq.q}</h3>
                  <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
                </summary>
                <div className="border-t px-5 pb-5 pt-4">
                  <p className="text-sm leading-relaxed text-muted-foreground">{faq.a}</p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      <CtaSection />
    </div>
  );
}
