"use client";

import Link from "next/link";
import Script from "next/script";
import { ServiceCta } from "@/components/shared/service-cta";
import {
  Search, Sparkles, ArrowRight, Network, FileSearch, DollarSign,
  Calendar, Shield, Activity, BarChart3, GitCompare, Star,
} from "lucide-react";

interface ToolCard {
  href: string;
  icon: React.ElementType;
  title: string;
  desc: string;
  popular?: boolean;
}

const TOOL_CARDS: ToolCard[] = [
  {
    href: "/tools/bulk-analysis",
    icon: BarChart3,
    title: "대량 분석",
    desc: "여러 도메인을 한번에 입력하면 검색 점수, 백링크를 일괄 분석",
    popular: true,
  },
  {
    href: "/tools/domain-compare",
    icon: GitCompare,
    title: "도메인 비교",
    desc: "2~3개 도메인을 나란히 비교하여 어떤 도메인이 더 좋은지 판단",
    popular: true,
  },
  {
    href: "/tools/domain-availability",
    icon: Search,
    title: "도메인 가용성 확인",
    desc: "사용하고 싶은 도메인 이름이 등록 가능한지 한 번에 확인",
  },
  {
    href: "/tools/domain-generator",
    icon: Sparkles,
    title: "AI 도메인 이름 생성기",
    desc: "키워드만 입력하면 AI가 사업에 맞는 도메인 이름을 추천",
    popular: true,
  },
  {
    href: "/tools/domain-value",
    icon: DollarSign,
    title: "도메인 가치 평가",
    desc: "도메인의 예상 시장 가치를 기본 + SEO 데이터 기반으로 평가",
  },
  {
    href: "/tools/dns-checker",
    icon: Network,
    title: "DNS 조회",
    desc: "A, CNAME, MX, TXT, NS 레코드를 즉시 조회",
  },
  {
    href: "/tools/whois-lookup",
    icon: FileSearch,
    title: "WHOIS 조회",
    desc: "도메인 소유자, 등록일, 만료일, 등록기관 조회",
  },
  {
    href: "/tools/domain-expiry",
    icon: Calendar,
    title: "도메인 만료일 확인",
    desc: "만료 예정일과 도메인 나이를 확인, 만료 시 경매 기회 포착",
  },
  {
    href: "/tools/ssl-checker",
    icon: Shield,
    title: "SSL 인증서 확인",
    desc: "SSL 인증서 유효 기간, 발급 기관, 보안 상태 점검",
  },
  {
    href: "/tools/http-status",
    icon: Activity,
    title: "HTTP 상태 확인",
    desc: "사이트 접속 상태와 리다이렉트 경로를 추적",
  },
];

const FAQ_ITEMS = [
  { q: "도메인체커의 도구는 무료인가요?", a: "네, 모든 기본 도구는 회원가입 없이 무료로 사용할 수 있습니다. 일부 심화 지표는 Pro 구독에서 제공됩니다." },
  { q: "하루에 몇 번 사용할 수 있나요?", a: "무료 사용자는 도구별로 하루 3~5회 사용할 수 있습니다. Pro 구독 시 모든 도구를 무제한으로 사용할 수 있습니다." },
  { q: "분석 결과는 얼마나 정확한가요?", a: "도메인체커는 실시간 데이터를 기반으로 분석합니다. SEO 지표는 7일 캐시로 최신 상태를 유지하며, DNS/WHOIS/SSL 정보는 실시간으로 조회됩니다." },
  { q: "대량 분석은 몇 개까지 가능한가요?", a: "무료 사용자는 최대 5개, Pro 사용자는 최대 100개의 도메인을 한 번에 분석할 수 있습니다." },
];

const faqJsonLd = {
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

const GUIDE_SECTIONS = [
  {
    num: 1,
    title: "도메인 분석 — 투자 전 필수 점검",
    body: "도메인을 구매하기 전에 반드시 SEO 지표를 확인해야 합니다. 도메인체커에서 도메인 이름만 입력하면 DA(Domain Authority), DR(Domain Rating), TF(Trust Flow) 등 핵심 지표를 즉시 확인할 수 있습니다.",
    tip: "먼저 메인 검색창에서 개별 도메인을 분석한 뒤, 관심 있는 도메인들을 대량 분석 도구에 넣어 한눈에 비교하세요.",
  },
  {
    num: 2,
    title: "대량 분석 — 여러 도메인 한번에 스크리닝",
    body: "경매에서 수십 개의 도메인 중 가치 있는 것을 빠르게 골라내야 할 때 사용합니다. 도메인 목록을 한 줄에 하나씩 입력하면 각 도메인의 DA, PA, DR, TF, 백링크 수를 한눈에 비교할 수 있습니다.",
    tip: "경매 사이트에서 관심 도메인 목록을 복사해서 바로 붙여넣기 하세요.",
  },
  {
    num: 3,
    title: "도메인 비교 — 어떤 도메인이 더 좋을까?",
    body: "비슷한 도메인 2~3개 중 하나를 선택해야 할 때 유용합니다. 모든 SEO 지표를 나란히 놓고 비교하면 객관적인 판단이 가능합니다.",
    tip: "가격 대비 지표가 높은 도메인을 선택하세요. DA 30짜리가 DA 50짜리보다 가성비가 좋을 수 있습니다.",
  },
  {
    num: 4,
    title: "AI 도메인 이름 생성기 — 사업에 맞는 이름 찾기",
    body: "새로운 사업이나 프로젝트를 시작할 때, 키워드만 입력하면 AI가 브랜드에 적합한 도메인 이름을 추천합니다. 생성된 이름의 등록 가능 여부까지 바로 확인할 수 있습니다.",
  },
  {
    num: 5,
    title: "DNS/WHOIS/SSL 기술 점검 — 도메인 건강 진단",
    body: "도메인의 기술적 상태를 빠르게 확인합니다.",
    list: [
      "DNS 조회: A, MX, CNAME, TXT 등 레코드 확인",
      "WHOIS 조회: 소유자, 등록일, 만료일 확인",
      "SSL 확인: 인증서 유효성, 만료일 점검",
      "HTTP 상태: 리다이렉트 경로 추적",
    ],
    bodyAfter: "이 도구들은 도메인 구매 전 기술적 문제가 없는지 확인하거나, 자신의 도메인 설정을 점검할 때 유용합니다.",
  },
  {
    num: 6,
    title: "도메인 가치 평가 — 내 도메인은 얼마일까?",
    body: "도메인의 시장 가치를 객관적으로 평가합니다. 도메인 길이, TLD 가치, 백링크 자산, 검색 트래픽 등을 종합 분석하여 예상 가치를 산출합니다. 도메인 판매나 구매 협상 시 참고 자료로 활용하세요.",
  },
];

export default function ToolsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <Script
        id="tools-faq-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <h1 className="text-3xl font-bold tracking-tight">무료 도메인 도구 모음</h1>
      <p className="mt-2 text-muted-foreground">
        도메인 분석, 비교, 검색, 생성까지. 도메인에 관한 모든 도구를 무료로 사용하세요.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {TOOL_CARDS.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="group relative flex items-start gap-4 rounded-xl border p-5 transition-colors hover:border-primary/40 hover:bg-muted/30"
          >
            {card.popular && (
              <div className="absolute -top-2 -left-2 flex h-6 w-6 items-center justify-center rounded-full bg-amber-400 text-white shadow-sm">
                <Star className="h-3.5 w-3.5 fill-current" />
              </div>
            )}
            <card.icon className="mt-0.5 h-6 w-6 shrink-0 text-primary" />
            <div className="flex-1">
              <p className="font-semibold group-hover:text-primary">
                {card.title}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{card.desc}</p>
            </div>
            <ArrowRight className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1" />
          </Link>
        ))}
      </div>

      {/* SEO 콘텐츠 — 도구 활용 가이드 */}
      <section className="mt-16 border-t pt-12">
        <h2 className="text-2xl font-bold">도메인체커 무료 도구 활용 가이드</h2>
        <p className="mt-3 text-muted-foreground leading-relaxed">
          도메인체커가 제공하는 10가지 무료 도구를 활용하여 도메인 구매, 투자, 관리를 효율적으로 진행하는 방법을 안내합니다.
        </p>

        <div className="mt-10 space-y-6">
          {GUIDE_SECTIONS.map((section) => (
            <div key={section.num} className="rounded-xl border p-6">
              <h3 className="flex items-center gap-3 text-lg font-semibold">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                  {section.num}
                </span>
                {section.title}
              </h3>
              <p className="mt-3 text-muted-foreground leading-relaxed">
                {section.body}
              </p>
              {section.list && (
                <ul className="mt-3 space-y-2 pl-6 list-disc text-muted-foreground leading-relaxed">
                  {section.list.map((item, i) => (
                    <li key={i}>
                      <strong className="text-foreground">{item.split(":")[0]}:</strong>
                      {item.split(":").slice(1).join(":")}
                    </li>
                  ))}
                </ul>
              )}
              {section.bodyAfter && (
                <p className="mt-3 text-muted-foreground leading-relaxed">
                  {section.bodyAfter}
                </p>
              )}
              {section.tip && (
                <div className="mt-4 rounded-lg border-l-2 border-primary bg-primary/5 p-4">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    <strong className="text-foreground">활용 팁:</strong> {section.tip}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="mt-16 border-t pt-12">
        <h2 className="text-2xl font-bold text-center mb-8">자주 묻는 질문</h2>
        <div className="divide-y rounded-lg border">
          {FAQ_ITEMS.map((item, i) => (
            <details key={i} className="group">
              <summary className="flex cursor-pointer items-center justify-between px-5 py-4 text-sm font-medium hover:bg-muted/50">
                {item.q}
              </summary>
              <div className="px-5 pb-4 text-sm text-muted-foreground">{item.a}</div>
            </details>
          ))}
        </div>
      </section>

      <ServiceCta />
    </div>
  );
}
