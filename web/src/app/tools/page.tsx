"use client";

import Link from "next/link";
import Script from "next/script";
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
    title: "벌크 분석",
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
  { q: "벌크 분석은 몇 개까지 가능한가요?", a: "무료 사용자는 최대 5개, Pro 사용자는 최대 100개의 도메인을 한 번에 분석할 수 있습니다." },
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

      {/* SEO 콘텐츠 */}
      <section className="mt-16 border-t pt-12">
        <h2 className="text-2xl font-bold">도메인 분석이 왜 중요한가요?</h2>
        <p className="mt-3 text-muted-foreground leading-relaxed">
          도메인은 온라인 비즈니스의 첫인상입니다. 좋은 도메인을 선택하거나 중고 도메인을 구매하기 전에
          SEO 지표, 백링크 품질, 스팸 점수 등을 반드시 확인해야 합니다. 도메인체커의 무료 도구 모음을
          활용하면 도메인의 가치를 다각도로 분석할 수 있습니다.
        </p>

        <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <h3 className="font-semibold text-foreground">SEO 지표 분석</h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              Domain Authority(DA), Domain Rating(DR), Trust Flow(TF) 등 주요 SEO 지표를
              한 번에 확인하세요. 벌크 분석으로 여러 도메인을 동시에 비교할 수 있습니다.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-foreground">도메인 가치 평가</h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              도메인의 시장 가치를 객관적으로 평가합니다. 도메인 길이, TLD, 백링크 수,
              검색 트래픽 등을 종합 분석하여 예상 가치를 산출합니다.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-foreground">기술 점검 도구</h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              DNS 레코드, WHOIS 정보, SSL 인증서, HTTP 상태 코드까지. 도메인의 기술적
              상태를 빠르게 진단하고 문제를 발견할 수 있습니다.
            </p>
          </div>
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
    </div>
  );
}
