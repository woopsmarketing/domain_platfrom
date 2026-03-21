import type { Metadata } from "next";
import Link from "next/link";
import { Globe, Gavel, Search, BookOpen, ChevronDown, ArrowRight, CircleCheck, ShoppingBag, Coffee, Code, GraduationCap, Heart, Building2 } from "lucide-react";
import { DomainGeneratorClient } from "@/components/tools/domain-generator-client";

export const metadata: Metadata = {
  title: "AI 도메인 이름 생성기 — 키워드로 도메인 추천",
  description:
    "키워드를 입력하면 AI가 최적의 도메인 이름을 추천합니다. SEO, 브랜드, 유사성 스타일 중 선택하여 맞춤형 도메인을 찾아보세요.",
  keywords: [
    "도메인 이름 추천",
    "도메인 생성기",
    "도메인 아이디어",
    "AI 도메인 추천",
  ],
};

const FAQ_ITEMS = [
  {
    q: "AI 도메인 생성기는 어떻게 작동하나요?",
    a: "입력한 키워드와 선택한 스타일(SEO/브랜드/유사성)을 기반으로 최적의 도메인 이름 조합을 생성합니다. 생성된 이름은 자동으로 등록 가능 여부까지 확인됩니다.",
  },
  {
    q: "생성된 도메인을 바로 등록할 수 있나요?",
    a: "본 도구는 도메인 이름 아이디어를 제안하고 등록 가능 여부를 확인하는 서비스입니다. 실제 등록은 도메인 등록 업체를 통해 진행하시면 됩니다.",
  },
  {
    q: "어떤 스타일을 선택해야 하나요?",
    a: "검색 노출이 중요하다면 'SEO' 스타일을, 브랜드 구축이 목표라면 '브랜드' 스타일을, 이미 성공한 도메인과 비슷한 이름을 원하면 '유사성' 스타일을 선택하세요.",
  },
  {
    q: "도메인 이름을 고를 때 주의할 점은?",
    a: "가능하면 짧고 기억하기 쉬운 이름을 선택하세요. 하이픈이나 숫자는 피하는 것이 좋으며, 상표권 분쟁의 소지가 없는지도 확인해야 합니다.",
  },
  {
    q: "좋은 도메인 이름의 조건은 무엇인가요?",
    a: "짧고 발음하기 쉬우며, 키워드가 포함되어 있고, 다른 브랜드와 혼동되지 않는 이름이 좋은 도메인입니다. 가능하면 .com 확장자를 확보하는 것이 유리합니다.",
  },
];

const FAQ_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ_ITEMS.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.a,
    },
  })),
};

const RELATED_LINKS = [
  {
    href: "/",
    label: "도메인 분석",
    desc: "도메인 SEO 지수를 무료로 분석",
    icon: Globe,
  },
  {
    href: "/auctions",
    label: "실시간 경매",
    desc: "진행 중인 도메인 경매 확인",
    icon: Gavel,
  },
  {
    href: "/tools/domain-availability",
    label: "도메인 가용성 확인",
    desc: "도메인 등록 가능 여부 즉시 확인",
    icon: Search,
  },
  {
    href: "/blog/what-is-da",
    label: "DA란?",
    desc: "도메인 권위 지수 이해하기",
    icon: BookOpen,
  },
];

export default function DomainGeneratorPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_JSON_LD) }}
      />

      <div className="mx-auto max-w-4xl px-4 py-12">
        {/* Hero */}
        <section className="text-center">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            AI 도메인 이름{" "}
            <span className="bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
              생성기
            </span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
            키워드를 입력하면 최적의 도메인 이름을 추천합니다.
            SEO, 브랜드, 유사성 스타일 중 선택하여 맞춤형 도메인을 찾아보세요.
          </p>
        </section>

        {/* Generator */}
        <section className="mt-10">
          <DomainGeneratorClient />
        </section>

        {/* How to use */}
        <section className="mt-16">
          <h2 className="text-2xl font-bold tracking-tight">사용 방법</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-3">
            {[
              {
                step: "1",
                title: "키워드 입력",
                desc: '사업이나 서비스를 대표하는 키워드를 입력합니다. 예: "coffee"',
              },
              {
                step: "2",
                title: "스타일 선택",
                desc: "SEO, 브랜드, 유사성 중 원하는 도메인 이름 스타일을 선택합니다.",
              },
              {
                step: "3",
                title: "결과 확인",
                desc: "생성된 도메인 이름과 등록 가능 여부를 확인하고, 마음에 드는 도메인을 분석해보세요.",
              },
            ].map((item) => (
              <div
                key={item.step}
                className="rounded-lg border p-5"
              >
                <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  {item.step}
                </div>
                <h3 className="font-semibold">{item.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* 스타일별 가이드 */}
        <section className="mt-16">
          <h2 className="text-2xl font-bold tracking-tight">어떤 스타일을 선택해야 할까?</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            목적에 맞는 스타일을 선택하면 더 효과적인 도메인 이름을 찾을 수 있습니다.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {[
              {
                badge: "SEO",
                badgeColor: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400",
                title: "SEO 스타일",
                when: "검색엔진에서 잘 노출되고 싶을 때",
                desc: "키워드가 포함되어 직관적이며 검색 유입에 유리합니다.",
                examples: ["coffeehub.com", "bestcoffee.io"],
                recommend: "블로그, 정보성 사이트, 니치 비즈니스",
              },
              {
                badge: "브랜드",
                badgeColor: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400",
                title: "브랜드 스타일",
                when: "독특하고 기억에 남는 이름을 원할 때",
                desc: "짧고 발음하기 쉬운 창작 이름으로 강한 브랜드를 만듭니다.",
                examples: ["brewly.com", "kafex.io"],
                recommend: "스타트업, 앱, SaaS 서비스",
              },
              {
                badge: "유사성",
                badgeColor: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400",
                title: "유사성 스타일",
                when: "성공한 브랜드에서 영감을 받고 싶을 때",
                desc: "인기 도메인과 비슷하지만 고유한 이름으로 빠르게 포지셔닝합니다.",
                examples: ["shopwave.com", "techiflow.io"],
                recommend: "경쟁사 벤치마킹, 빠른 시장 진입",
              },
            ].map((item) => (
              <div key={item.badge} className="rounded-lg border p-5">
                <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${item.badgeColor}`}>
                  {item.badge}
                </span>
                <h3 className="mt-3 font-semibold">{item.title}</h3>
                <p className="mt-1 text-xs text-primary font-medium">{item.when}</p>
                <p className="mt-2 text-sm text-muted-foreground">{item.desc}</p>
                <div className="mt-3">
                  <p className="text-xs font-medium text-muted-foreground">예시</p>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {item.examples.map((ex) => (
                      <span key={ex} className="rounded bg-muted px-2 py-0.5 font-mono text-xs">{ex}</span>
                    ))}
                  </div>
                </div>
                <div className="mt-3 border-t pt-3">
                  <p className="text-xs text-muted-foreground">
                    <span className="font-medium">추천: </span>{item.recommend}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 네이밍 체크리스트 */}
        <section className="mt-16">
          <h2 className="text-2xl font-bold tracking-tight">도메인 이름 선택 체크리스트</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            도메인을 최종 결정하기 전에 아래 항목을 확인하세요.
          </p>
          <div className="mt-6 rounded-lg border">
            <div className="grid divide-y sm:grid-cols-2 sm:divide-x sm:divide-y-0">
              {[
                { left: true, items: [
                  "발음이 쉽고 기억하기 좋은가?",
                  "10자 이내인가?",
                  "하이픈이나 숫자가 없는가?",
                  "브랜드 상표와 충돌하지 않는가?",
                ] },
                { left: false, items: [
                  "SNS 핸들(아이디)도 사용 가능한가?",
                  "모바일에서 타이핑하기 편한가?",
                  "비즈니스 확장 시에도 적합한 이름인가?",
                  ".com 확장자로 등록 가능한가?",
                ] },
              ].map((col, ci) => (
                <ul key={ci} className="divide-y">
                  {col.items.map((item) => (
                    <li key={item} className="flex items-center gap-3 px-5 py-3.5 text-sm">
                      <CircleCheck className="h-4 w-4 shrink-0 text-green-500" />
                      {item}
                    </li>
                  ))}
                </ul>
              ))}
            </div>
          </div>
        </section>

        {/* 업종별 추천 예시 */}
        <section className="mt-16">
          <h2 className="text-2xl font-bold tracking-tight">업종별 도메인 네이밍 예시</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            업종에 맞는 네이밍 패턴을 참고하여 아이디어를 얻어보세요.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: ShoppingBag, category: "쇼핑몰", examples: ["shopmall", "stylehub", "trendmarket"] },
              { icon: Coffee, category: "카페/식음", examples: ["brewspot", "cafenow", "eatflow"] },
              { icon: Code, category: "IT/테크", examples: ["codelab", "devstack", "techbase"] },
              { icon: GraduationCap, category: "교육", examples: ["learnhub", "edupro", "studyzone"] },
              { icon: Heart, category: "건강/뷰티", examples: ["glowup", "fitzone", "wellnow"] },
              { icon: Building2, category: "부동산", examples: ["homespot", "realtyhub", "livezone"] },
            ].map((item) => (
              <div key={item.category} className="rounded-lg border p-5">
                <div className="flex items-center gap-2 mb-3">
                  <item.icon className="h-4 w-4 text-primary" />
                  <span className="font-semibold text-sm">{item.category}</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {item.examples.map((ex) => (
                    <span key={ex} className="rounded bg-muted px-2 py-1 font-mono text-xs text-muted-foreground">
                      {ex}.com
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="mt-16">
          <h2 className="text-2xl font-bold tracking-tight">자주 묻는 질문</h2>
          <div className="mt-6 divide-y rounded-lg border">
            {FAQ_ITEMS.map((item, i) => (
              <details key={i} className="group">
                <summary className="flex cursor-pointer items-center justify-between px-5 py-4 text-sm font-medium hover:bg-muted/50">
                  {item.q}
                  <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
                </summary>
                <div className="px-5 pb-4 text-sm text-muted-foreground">
                  {item.a}
                </div>
              </details>
            ))}
          </div>
        </section>

        {/* Related tools */}
        <section className="mt-16">
          <h2 className="text-2xl font-bold tracking-tight">관련 도구</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {RELATED_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="group flex items-start gap-4 rounded-lg border p-5 transition-colors hover:border-primary/40 hover:bg-muted/30"
              >
                <link.icon className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                <div className="flex-1">
                  <p className="font-medium group-hover:text-primary">
                    {link.label}
                  </p>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {link.desc}
                  </p>
                </div>
                <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1" />
              </Link>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
