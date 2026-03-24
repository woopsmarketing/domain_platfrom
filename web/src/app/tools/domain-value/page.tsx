import type { Metadata } from "next";
import Link from "next/link";
import { Globe, Search, Gavel, ChevronDown, ArrowRight, DollarSign, TrendingUp, BarChart3, Scale, Calculator } from "lucide-react";
import { DomainValueClient } from "@/components/tools/domain-value-client";

export const metadata: Metadata = {
  title: "도메인 가치 평가 — 내 도메인 얼마일까? 무료 감정",
  description:
    "도메인의 예상 가치를 무료로 확인하세요. 도메인 길이, 확장자, 검색 점수, 백링크를 종합 분석하여 시장 가치를 추정합니다. 도메인 매매 전 필수 확인 도구.",
  keywords: [
    "도메인 가치 평가", "도메인 가격 조회", "도메인 시세 조회", "도메인 감정",
    "도메인 appraisal", "도메인 가격 측정", "도메인 가치 계산", "도메인 얼마인지 확인",
    "이 도메인 얼마일까", "도메인 판매가 예측", "프리미엄 도메인 조회",
    "도메인 투자 가치", "도메인 매매 시세", "도메인 resale value",
    "도메인 포트폴리오 가치", "도메인 평가 사이트", "도메인 가치 분석",
  ],
  openGraph: {
    title: "도메인 가치 평가 — 내 도메인 얼마일까?",
    description: "도메인 예상 가치를 무료로 확인하세요. 종합 분석 기반 시장 가치 추정.",
    type: "website",
    siteName: "도메인체커",
  },
};

const FAQ_ITEMS = [
  {
    q: "도메인 가치는 어떻게 결정되나요?",
    a: "도메인 가치는 도메인 길이, 확장자(.com이 가장 높음), 검색 점수, 백링크 수, 도메인 나이, 키워드 포함 여부 등 여러 요소에 의해 결정됩니다. 짧고 기억하기 쉬우며 .com 확장자를 가진 도메인이 가장 높은 가치를 가집니다.",
  },
  {
    q: "이 평가 결과를 신뢰할 수 있나요?",
    a: "이 도구는 공개된 데이터를 기반으로 한 참고용 추정치입니다. 실제 거래 가격은 구매자와 판매자 간의 협상, 시장 상황, 특정 키워드의 수요 등에 따라 달라질 수 있습니다. 거래 전 낙찰 이력 페이지에서 유사 도메인의 실제 거래가를 참고하세요.",
  },
  {
    q: "가치가 높은 도메인의 특징은 무엇인가요?",
    a: "짧은 길이(5자 이하), .com 확장자, 높은 검색 점수, 풍부한 백링크, 기억하기 쉬운 단어, 상업적 키워드 포함, 오랜 도메인 나이가 가치를 높이는 핵심 요소입니다.",
  },
  {
    q: "도메인을 어디서 판매할 수 있나요?",
    a: "GoDaddy Auctions, Namecheap Marketplace, Sedo, Afternic 등의 플랫폼에서 도메인을 판매할 수 있습니다. 도메인 가치를 미리 파악해두면 적정 판매가를 설정하는 데 도움이 됩니다.",
  },
  {
    q: "프리미엄 도메인이란 무엇인가요?",
    a: "프리미엄 도메인은 일반 등록 가격보다 높은 가격이 책정된 도메인입니다. 짧거나, 인기 키워드를 포함하거나, 브랜드 가치가 높은 도메인이 프리미엄으로 분류됩니다. 이미 누군가가 보유하고 있어 시장에서 거래되는 도메인도 포함됩니다.",
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
  { href: "/", label: "도메인 분석", desc: "도메인 점수와 이력을 무료로 분석", icon: Globe },
  { href: "/market-history", label: "도메인 거래 시세", desc: "실제 경매 낙찰 가격 데이터", icon: DollarSign },
  { href: "/auctions", label: "도메인 경매", desc: "진행 중인 도메인 경매 확인", icon: Gavel },
  { href: "/tools/whois-lookup", label: "WHOIS 조회", desc: "도메인 소유자 · 만료일 확인", icon: Search },
];

export default function DomainValuePage() {
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
            도메인 가치 평가 —{" "}
            <span className="bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
              내 도메인 얼마일까?
            </span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
            도메인 이름만 입력하면 길이, 확장자, 문자 구성을 종합 분석하여
            예상 시장 가치를 알려드립니다. 도메인 매매 전 참고용으로 활용하세요.
          </p>
        </section>

        {/* Value Tool */}
        <section className="mt-10">
          <DomainValueClient />
        </section>

        {/* 가치 결정 요인 */}
        <section className="mt-16">
          <h2 className="text-2xl font-bold tracking-tight">도메인 가치를 결정하는 핵심 요소</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            도메인의 시장 가치는 여러 요인의 종합으로 결정됩니다.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: Calculator,
                title: "도메인 길이",
                desc: "짧을수록 가치가 높습니다. 3~5자 도메인은 프리미엄 가격에 거래되며, 15자 이상은 가치가 크게 떨어집니다.",
              },
              {
                icon: Globe,
                title: "확장자 (TLD)",
                desc: ".com이 가장 높은 가치를 가지며, .net, .org가 그 뒤를 잇습니다. .io, .ai 등은 특정 업계에서 프리미엄입니다.",
              },
              {
                icon: BarChart3,
                title: "검색 점수",
                desc: "도메인의 검색엔진 점수가 높을수록 가치가 올라갑니다. 기존 SEO 자산이 축적된 도메인은 프리미엄을 받습니다.",
              },
              {
                icon: TrendingUp,
                title: "백링크 프로필",
                desc: "양질의 백링크가 많은 도메인은 SEO 자산이 축적되어 있어 높은 가치를 가집니다.",
              },
              {
                icon: Scale,
                title: "키워드 가치",
                desc: "상업적 가치가 높은 키워드(보험, 대출, 부동산 등)를 포함한 도메인은 높은 프리미엄이 붙습니다.",
              },
              {
                icon: DollarSign,
                title: "도메인 나이",
                desc: "오래된 도메인은 검색엔진 신뢰도가 높아 더 높은 가치를 인정받습니다.",
              },
            ].map((item) => (
              <div key={item.title} className="rounded-lg border p-5">
                <item.icon className="mb-3 h-5 w-5 text-primary" />
                <h3 className="font-semibold">{item.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 가치 등급 기준 */}
        <section className="mt-16">
          <h2 className="text-2xl font-bold tracking-tight">도메인 가치 등급 기준</h2>
          <div className="mt-6 overflow-x-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40">
                  <th className="px-4 py-3 text-left font-semibold">등급</th>
                  <th className="px-4 py-3 text-left font-semibold">추정 가격</th>
                  <th className="px-4 py-3 text-left font-semibold">특징</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {[
                  {
                    grade: "Premium",
                    color: "text-amber-500",
                    price: "$10,000+",
                    desc: "3~4자, .com, 높은 점수, 풍부한 백링크",
                  },
                  {
                    grade: "High",
                    color: "text-green-500",
                    price: "$1,000~$10,000",
                    desc: "5~7자, .com/.net, 좋은 점수, 키워드 포함",
                  },
                  {
                    grade: "Medium",
                    color: "text-blue-500",
                    price: "$100~$1,000",
                    desc: "8~12자, 보통 점수, 일부 백링크 보유",
                  },
                  {
                    grade: "Low",
                    color: "text-muted-foreground",
                    price: "$10~$100",
                    desc: "13자+, 낮은 점수, 백링크 부족",
                  },
                ].map((row) => (
                  <tr key={row.grade} className="hover:bg-muted/30">
                    <td className={`px-4 py-3 font-semibold ${row.color}`}>{row.grade}</td>
                    <td className="px-4 py-3 font-mono">{row.price}</td>
                    <td className="px-4 py-3 text-muted-foreground">{row.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
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
