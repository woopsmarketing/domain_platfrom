import type { Metadata } from "next";
import Link from "next/link";
import { Globe, Gavel, Sparkles, BookOpen, ChevronDown, ArrowRight, CircleCheck, TrendingUp, ChartBar } from "lucide-react";
import { DomainAvailabilityClient } from "@/components/tools/domain-availability-client";

export const metadata: Metadata = {
  title: "도메인 이름 검색 — 등록 가능한 도메인 찾기",
  description:
    "사용하고 싶은 도메인 이름이 등록 가능한지 바로 확인하세요. .com, .net, .io, .ai 등 다양한 확장자를 한 번에 검색. 도메인 구매 전 필수 확인 도구.",
  keywords: [
    "도메인 이름 검색", "도메인 등록 확인", "도메인 구매 가능 확인", "도메인 이름 찾기",
    "도메인 등록 여부", "빈 도메인 찾기", "도메인 사용 가능 확인", "도메인 중복 확인",
    "도메인 가능 여부 확인", "브랜드 도메인 찾기", "짧은 도메인 찾기",
    "com net org 차이", "도메인 확장자 추천", "사업용 도메인 추천", "도메인 추천",
  ],
};

const FAQ_ITEMS = [
  {
    q: "도메인 등록 가능 여부는 어떻게 확인하나요?",
    a: "검색창에 원하는 도메인 이름을 입력하면, 선택한 확장자(.com, .net 등)별로 등록 가능 여부를 즉시 확인할 수 있습니다. 이미 등록된 도메인은 빨간색으로, 등록 가능한 도메인은 초록색으로 표시됩니다.",
  },
  {
    q: "도메인이 이미 등록되어 있으면 어떻게 하나요?",
    a: "이미 등록된 도메인의 경우, 분석 페이지에서 해당 도메인의 점수와 만료일 등을 확인할 수 있습니다. 만료가 가까운 도메인이라면 경매를 통해 취득할 수도 있습니다.",
  },
  {
    q: ".com과 .net 중 어떤 것을 선택해야 하나요?",
    a: ".com은 가장 인지도가 높고 신뢰받는 확장자이며 SEO에도 유리합니다. .net은 기술/네트워크 관련 사이트에 적합합니다. 브랜드 인지도가 중요하다면 .com을 우선 추천합니다.",
  },
  {
    q: "도메인 등록 후 바로 사용할 수 있나요?",
    a: "네, 도메인을 등록하면 즉시 DNS 설정을 통해 웹사이트나 이메일 서비스에 연결할 수 있습니다. DNS 전파에는 보통 수 분에서 최대 48시간이 소요될 수 있습니다.",
  },
  {
    q: "만료된 도메인은 다시 등록할 수 있나요?",
    a: "만료된 도메인은 일정 유예 기간이 지나면 다시 등록할 수 있습니다. 인기 있는 도메인은 경매를 통해 거래되는 경우가 많으며, 낙찰 이력 페이지에서 관련 정보를 확인할 수 있습니다.",
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
    desc: "도메인 점수와 이력을 무료로 분석",
    icon: Globe,
  },
  {
    href: "/auctions",
    label: "실시간 경매",
    desc: "진행 중인 도메인 경매 확인",
    icon: Gavel,
  },
  {
    href: "/tools/domain-generator",
    label: "AI 도메인 생성기",
    desc: "키워드로 도메인 이름 추천",
    icon: Sparkles,
  },
  {
    href: "/blog/what-is-da",
    label: "도메인 점수란?",
    desc: "도메인 점수의 의미 이해하기",
    icon: BookOpen,
  },
];

export default function DomainAvailabilityPage() {
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
            원하는 도메인 이름,{" "}
            <span className="bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
              바로 검색
            </span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
            사용하고 싶은 도메인 이름을 입력하고, .com부터 .ai까지 한 번에 등록 가능 여부를 확인하세요. 도메인 구매 전 꼭 거쳐야 할 첫 단계입니다.
          </p>
        </section>

        {/* Search */}
        <section className="mt-10">
          <DomainAvailabilityClient />
        </section>

        {/* How to use */}
        <section className="mt-16">
          <h2 className="text-2xl font-bold tracking-tight">사용 방법</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-3">
            {[
              {
                step: "1",
                title: "이름 입력",
                desc: '원하는 도메인 이름을 입력합니다. 예: "myshop"',
              },
              {
                step: "2",
                title: "확장자 선택",
                desc: "확인하려는 TLD를 선택합니다. 기본으로 모든 확장자가 선택됩니다.",
              },
              {
                step: "3",
                title: "결과 확인",
                desc: "등록 가능한 도메인은 초록색으로 표시되며, 클릭하면 상세 분석 페이지로 이동합니다.",
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

        {/* TLD 비교 가이드 */}
        <section className="mt-16">
          <h2 className="text-2xl font-bold tracking-tight">확장자(TLD) 비교 가이드</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            어떤 확장자가 내 비즈니스에 맞는지 한눈에 비교해보세요.
          </p>
          <div className="mt-6 overflow-x-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40">
                  <th className="px-4 py-3 text-left font-semibold">확장자</th>
                  <th className="px-4 py-3 text-left font-semibold">용도</th>
                  <th className="px-4 py-3 text-left font-semibold">연간 비용</th>
                  <th className="px-4 py-3 text-left font-semibold">SEO 영향</th>
                  <th className="px-4 py-3 text-left font-semibold">추천 대상</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {[
                  { tld: ".com", use: "상업/범용", cost: "$10~15", seo: "높음", target: "모든 비즈니스", highlight: true },
                  { tld: ".net", use: "네트워크/기술", cost: "$10~15", seo: "보통", target: "IT/기술 기업", highlight: false },
                  { tld: ".org", use: "비영리/커뮤니티", cost: "$10~15", seo: "보통", target: "비영리, 오픈소스", highlight: false },
                  { tld: ".io", use: "스타트업/기술", cost: "$30~50", seo: "보통", target: "SaaS, 테크 스타트업", highlight: false },
                  { tld: ".ai", use: "AI/기술", cost: "$50~80", seo: "보통", target: "AI/ML 서비스", highlight: false },
                  { tld: ".co", use: "상업/스타트업", cost: "$20~30", seo: "보통", target: "글로벌 스타트업", highlight: false },
                  { tld: ".dev", use: "개발자", cost: "$15~20", seo: "보통", target: "개발 도구, 포트폴리오", highlight: false },
                  { tld: ".app", use: "애플리케이션", cost: "$15~20", seo: "보통", target: "모바일/웹 앱", highlight: false },
                ].map((row) => (
                  <tr key={row.tld} className={row.highlight ? "bg-primary/5" : "hover:bg-muted/30"}>
                    <td className="px-4 py-3">
                      <span className={`font-mono font-semibold ${row.highlight ? "text-primary" : ""}`}>
                        {row.tld}
                      </span>
                      {row.highlight && (
                        <span className="ml-2 rounded-full bg-primary/10 px-1.5 py-0.5 text-xs text-primary">추천</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{row.use}</td>
                    <td className="px-4 py-3 text-muted-foreground">{row.cost}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium ${row.seo === "높음" ? "text-green-600 dark:text-green-400" : "text-muted-foreground"}`}>
                        {row.seo}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{row.target}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* 도메인 선택 5가지 원칙 */}
        <section className="mt-16">
          <h2 className="text-2xl font-bold tracking-tight">좋은 도메인을 선택하는 5가지 원칙</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            수천 개의 도메인 거래 데이터를 분석한 결과에서 도출한 원칙입니다.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                num: "01",
                title: "짧을수록 좋다",
                desc: "15자 이하, 2단어 이내가 이상적입니다. 짧은 도메인은 기억하기 쉽고 타이핑 오류도 줄어듭니다.",
              },
              {
                num: "02",
                title: "발음하기 쉬워야 한다",
                desc: "전화로 불러줄 수 있는 이름이어야 합니다. 발음하기 어려운 도메인은 구전 마케팅에 불리합니다.",
              },
              {
                num: "03",
                title: "하이픈은 피하라",
                desc: "하이픈(-)이 들어간 도메인은 SEO에 불리하고 사용자가 기억하기 어렵습니다.",
              },
              {
                num: "04",
                title: "키워드를 포함하라",
                desc: "비즈니스와 관련된 단어를 포함하면 검색엔진 최적화에 유리하고 방문자에게 직관적입니다.",
              },
              {
                num: "05",
                title: ".com을 우선하라",
                desc: "사용자 신뢰도와 기억력에서 .com이 압도적입니다. .com을 먼저 확보하고 보조 확장자를 추가하세요.",
              },
            ].map((item) => (
              <div key={item.num} className="rounded-lg border p-5">
                <div className="mb-3 text-3xl font-black text-primary/20">{item.num}</div>
                <h3 className="font-semibold">{item.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 도메인 시장 통계 */}
        <section className="mt-16">
          <h2 className="text-2xl font-bold tracking-tight">도메인 시장 통계 2026</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            글로벌 도메인 시장의 규모와 트렌드를 확인하세요.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: Globe,
                stat: "3.5억+",
                label: "전 세계 등록 도메인",
                note: "2026년 기준",
              },
              {
                icon: ChartBar,
                stat: "37%",
                label: ".com 점유율",
                note: "가장 신뢰받는 확장자",
              },
              {
                icon: TrendingUp,
                stat: "10만+",
                label: "하루 평균 신규 등록",
                note: "꾸준히 증가 중",
              },
              {
                icon: CircleCheck,
                stat: "$2,000~$5,000",
                label: "평균 도메인 거래 가격",
                note: "프리미엄 도메인 기준",
              },
            ].map((item) => (
              <div key={item.label} className="rounded-lg border p-5 text-center">
                <item.icon className="mx-auto mb-3 h-6 w-6 text-primary" />
                <div className="text-2xl font-bold">{item.stat}</div>
                <div className="mt-1 text-sm font-medium">{item.label}</div>
                <div className="mt-0.5 text-xs text-muted-foreground">{item.note}</div>
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
