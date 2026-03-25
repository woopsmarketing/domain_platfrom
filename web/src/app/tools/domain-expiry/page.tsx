import type { Metadata } from "next";
import Link from "next/link";
import {
  Globe,
  Gavel,
  Search,
  BookOpen,
  ChevronDown,
  ArrowRight,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Clock,
} from "lucide-react";
import { DomainExpiryClient } from "@/components/tools/domain-expiry-client";

export const metadata: Metadata = {
  title: "도메인 만료일 확인 — 만료 예정 도메인 조회",
  description:
    "도메인의 만료일을 무료로 확인하세요. 만료가 가까운 도메인은 경매에 나올 수 있습니다. 관심 도메인의 만료 예정일, 등록일, 도메인 나이를 즉시 조회합니다.",
  keywords: [
    "도메인 만료일 확인",
    "도메인 만료일 조회",
    "도메인 만료 확인",
    "도메인 갱신",
    "도메인 만료 후 구매",
    "만료 예정 도메인",
    "도메인 나이 확인",
    "도메인 age 확인",
    "도메인 등록일 확인",
    "도메인 만료 후 복구",
    "도메인 언제 풀리나",
    "도메인 삭제 일정",
    "만료도메인 구매 시점",
    "도메인 갱신 비용",
  ],
  openGraph: {
    title: "도메인 만료일 확인 — 만료 예정 도메인 조회",
    description:
      "도메인 만료일을 무료로 확인하세요. 만료가 가까운 도메인은 경매에 나올 수 있습니다.",
    type: "website",
    siteName: "도메인체커",
  },
};

const FAQ_ITEMS = [
  {
    q: "도메인 만료일은 어떻게 확인하나요?",
    a: "위 검색창에 도메인을 입력하면 등록일, 만료일, 도메인 나이를 즉시 확인할 수 있습니다. RDAP 프로토콜을 통해 실시간으로 정확한 만료일 정보를 가져옵니다.",
  },
  {
    q: "도메인이 만료되면 어떻게 되나요?",
    a: "도메인이 만료되면 일정 유예 기간(Grace Period)을 거친 후, 경매에 나오거나 삭제되어 다시 등록 가능해집니다. 인기 도메인은 대부분 경매를 통해 거래됩니다.",
  },
  {
    q: "만료된 도메인은 언제 구매할 수 있나요?",
    a: "만료 후 약 30~75일의 유예/경매 기간이 있습니다. 등록기관에 따라 다르지만, 보통 만료 후 45일 전후로 경매에 나오고, 경매 종료 후 삭제되면 누구나 등록 가능합니다.",
  },
  {
    q: "관심 있는 도메인의 만료일을 미리 알 수 있나요?",
    a: "네, 이 도구로 만료일을 확인한 후 직접 모니터링하거나, 만료 시점에 맞춰 경매 페이지에서 해당 도메인을 찾아볼 수 있습니다.",
  },
  {
    q: "도메인 나이는 왜 중요한가요?",
    a: "도메인 나이가 오래될수록 검색엔진이 더 신뢰합니다. 오래된 만료 도메인은 SEO 가치가 높아 투자 대상으로 인기가 있습니다.",
  },
];

const FAQ_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ_ITEMS.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: { "@type": "Answer", text: item.a },
  })),
};

const RELATED_LINKS = [
  {
    href: "/auctions",
    label: "도메인 경매",
    desc: "현재 진행 중인 경매 도메인 확인",
    icon: Gavel,
  },
  {
    href: "/market-history",
    label: "도메인 거래 시세",
    desc: "실제 낙찰 가격 데이터 조회",
    icon: Globe,
  },
  {
    href: "/tools/whois-lookup",
    label: "WHOIS 조회",
    desc: "도메인 소유자 · 등록기관 확인",
    icon: Search,
  },
  {
    href: "/tools/domain-value",
    label: "도메인 가치 평가",
    desc: "도메인 예상 가치 확인",
    icon: BookOpen,
  },
];

const EXPIRY_STEPS = [
  {
    icon: Clock,
    step: "1",
    title: "유예 기간",
    period: "만료 후 0~30일",
    desc: "소유자가 추가 비용 없이 갱신 가능합니다. 이 기간에는 다른 사람이 등록할 수 없습니다.",
  },
  {
    icon: AlertTriangle,
    step: "2",
    title: "복구 기간",
    period: "30~45일",
    desc: "소유자가 추가 비용을 내고 복구할 수 있습니다. 일반 갱신보다 비용이 높습니다.",
  },
  {
    icon: Gavel,
    step: "3",
    title: "경매 기간",
    period: "45~75일",
    desc: "인기 도메인은 경매에 올라갑니다. 입찰을 통해 새 소유자가 결정됩니다.",
  },
  {
    icon: CheckCircle2,
    step: "4",
    title: "삭제/등록 가능",
    period: "75일 이후",
    desc: "경매에서 낙찰되지 않으면 삭제되어 누구나 등록 가능해집니다.",
  },
];

export default function DomainExpiryPage() {
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
            도메인 만료일{" "}
            <span className="bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
              즉시 확인
            </span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
            관심 있는 도메인의 만료 예정일과 도메인 나이를 확인하세요.
            만료가 가까운 도메인은 경매에 나올 수 있습니다.
          </p>
        </section>

        {/* Tool */}
        <section className="mt-10">
          <DomainExpiryClient />
        </section>

        {/* 도메인 만료 후 프로세스 */}
        <section className="mt-16">
          <h2 className="text-2xl font-bold tracking-tight">
            도메인 만료 후 어떤 일이 일어나나요?
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            도메인이 만료되면 바로 삭제되지 않습니다. 아래 단계를 거칩니다.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {EXPIRY_STEPS.map((item) => (
              <div key={item.step} className="rounded-lg border p-5">
                <item.icon className="mb-3 h-5 w-5 text-primary" />
                <div className="text-xs font-medium text-primary mb-1">Step {item.step}</div>
                <h3 className="font-semibold">{item.title}</h3>
                <p className="text-xs text-muted-foreground mt-0.5 mb-2">{item.period}</p>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA: 경매 페이지 */}
        <section className="mt-16">
          <div className="rounded-xl border border-primary/20 bg-gradient-to-r from-primary/5 to-blue-500/5 p-6 text-center">
            <Gavel className="mx-auto h-8 w-8 text-primary mb-3" />
            <h2 className="text-xl font-bold">
              만료 예정 도메인이 경매에 나왔는지 확인하세요
            </h2>
            <p className="mt-2 text-sm text-muted-foreground max-w-lg mx-auto">
              관심 있는 도메인이 곧 만료된다면, 경매 페이지에서 해당 도메인의 입찰 현황을
              확인해보세요. 좋은 도메인을 합리적인 가격에 구매할 기회입니다.
            </p>
            <div className="mt-4 flex justify-center gap-3 flex-wrap">
              <Link
                href="/auctions"
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                <Gavel className="h-4 w-4" />
                실시간 경매 보기
              </Link>
              <Link
                href="/market-history"
                className="inline-flex items-center gap-2 rounded-lg border px-5 py-2.5 text-sm font-medium hover:bg-muted transition-colors"
              >
                거래 시세 확인
              </Link>
            </div>
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
                <div className="px-5 pb-4 text-sm text-muted-foreground">{item.a}</div>
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
                  <p className="font-medium group-hover:text-primary">{link.label}</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">{link.desc}</p>
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
