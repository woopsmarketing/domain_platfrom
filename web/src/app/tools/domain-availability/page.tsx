import type { Metadata } from "next";
import Link from "next/link";
import { Globe, Gavel, Sparkles, BookOpen, ChevronDown, ArrowRight } from "lucide-react";
import { DomainAvailabilityClient } from "@/components/tools/domain-availability-client";

export const metadata: Metadata = {
  title: "도메인 등록 가능 여부 확인 — 무료 도메인 검색",
  description:
    "원하는 도메인 이름이 등록 가능한지 즉시 확인하세요. .com, .net, .io, .ai 등 다양한 확장자를 한 번에 검색합니다.",
  keywords: [
    "도메인 등록 확인",
    "도메인 검색",
    "도메인 가용성",
    "도메인 구매 가능 확인",
  ],
};

const FAQ_ITEMS = [
  {
    q: "도메인 등록 가능 여부는 어떻게 확인하나요?",
    a: "검색창에 원하는 도메인 이름을 입력하면, 선택한 확장자(.com, .net 등)별로 등록 가능 여부를 즉시 확인할 수 있습니다. 이미 등록된 도메인은 빨간색으로, 등록 가능한 도메인은 초록색으로 표시됩니다.",
  },
  {
    q: "도메인이 이미 등록되어 있으면 어떻게 하나요?",
    a: "이미 등록된 도메인의 경우, 분석 페이지에서 해당 도메인의 SEO 지수와 만료일 등을 확인할 수 있습니다. 만료가 가까운 도메인이라면 경매를 통해 취득할 수도 있습니다.",
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
    href: "/tools/domain-generator",
    label: "AI 도메인 생성기",
    desc: "키워드로 도메인 이름 추천",
    icon: Sparkles,
  },
  {
    href: "/blog/what-is-da",
    label: "DA란?",
    desc: "도메인 권위 지수 이해하기",
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
            도메인 등록 가능 여부{" "}
            <span className="bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
              즉시 확인
            </span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
            원하는 도메인 이름을 입력하고, .com부터 .ai까지 다양한 확장자의
            등록 가능 여부를 한 번에 확인하세요.
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
