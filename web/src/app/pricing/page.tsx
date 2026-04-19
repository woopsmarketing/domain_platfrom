"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, X, Sparkles, Zap, ChevronDown } from "lucide-react";
import Script from "next/script";

const FREE_FEATURES = [
  { text: "도메인 분석 (1일 5회)", included: true },
  { text: "AI 도메인 생성기 (1일 3회)", included: true },
  { text: "대량 분석 (5개, 1일 1회)", included: true },
  { text: "도메인 비교 (2개)", included: true },
  { text: "기본 지표 (DA/PA/DR/TF/CF/백링크/참조도메인)", included: true },
  { text: "Wayback 스냅샷 수", included: true },
  { text: "DNS/WHOIS/SSL/HTTP 도구 (1일 10회)", included: true },
  { text: "낙찰 이력 (최근 24시간만)", included: true },
  { text: "Ahrefs 트래픽, 트래픽 가치, 키워드", included: false },
  { text: "Moz Links, 스팸 점수", included: false },
  { text: "Majestic Links, 참조 도메인", included: false },
  { text: "전체 낙찰 이력 (낙찰가/입찰수/낙찰일)", included: false },
  { text: "고도화 도메인 가치 평가 (SEO 데이터 기반)", included: false },
  { text: "광고 없음", included: false },
];

const PRO_FEATURES = [
  { text: "도메인 분석 무제한", included: true },
  { text: "AI 도메인 생성기 무제한", included: true },
  { text: "대량 분석 (100개, 무제한 횟수)", included: true },
  { text: "도메인 비교 (10개)", included: true },
  { text: "모든 SEO 지표 (DA/PA/DR/TF/CF + 트래픽/키워드/스팸)", included: true },
  { text: "Moz Links, 스팸 점수 확인", included: true },
  { text: "Ahrefs 트래픽, 트래픽 가치($), 키워드", included: true },
  { text: "Majestic Links, 참조 도메인", included: true },
  { text: "DNS/WHOIS/SSL/HTTP 도구 무제한", included: true },
  { text: "전체 낙찰 이력 (낙찰가/입찰수/낙찰일)", included: true },
  { text: "고도화 도메인 가치 평가 (SEO 데이터 기반)", included: true },
  { text: "광고 없음", included: true },
];

const FAQ_ITEMS = [
  {
    q: "무료로 어떤 기능을 사용할 수 있나요?",
    a: "무료 플랜으로 도메인 점수(DA/PA), 백링크 등급(DR/TF/CF), 백링크 수, 참조 도메인, Wayback 스냅샷을 확인할 수 있습니다. AI 도메인 생성기(1일 3회), 대량 분석(5개, 1일 1회), DNS/WHOIS/SSL/HTTP 도구도 무료로 제공됩니다.",
  },
  {
    q: "연간 결제 할인이 있나요?",
    a: "네, 연간 결제 시 월 ₩6,900으로 약 30% 할인됩니다 (연 ₩82,800).",
  },
  {
    q: "환불 정책은 어떻게 되나요?",
    a: "Pro 구독은 7일 이내 무조건 환불이 가능합니다. 별도의 사유 없이 전액 환불됩니다.",
  },
  {
    q: "구독을 취소하면 어떻게 되나요?",
    a: "구독을 취소해도 현재 결제 기간이 끝날 때까지 Pro 기능을 계속 사용할 수 있습니다. 기간 종료 후 자동으로 Free 플랜으로 전환됩니다.",
  },
  {
    q: "Pro와 Free의 가장 큰 차이는 무엇인가요?",
    a: "Free는 기본 SEO 지표와 하루 5회 분석을 제공합니다. Pro는 분석 횟수 무제한, Ahrefs 트래픽/키워드, Moz 스팸 점수, 전체 낙찰 이력, 고도화 가치 평가 등 심화 데이터를 포함합니다.",
  },
  {
    q: "결제 수단은 무엇을 지원하나요?",
    a: "신용카드, 체크카드로 결제할 수 있습니다. 해외 결제가 가능한 카드라면 모두 사용 가능합니다.",
  },
];

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");

  const monthlyPrice = billingCycle === "yearly" ? "6,900" : "9,900";
  const yearlyNote =
    billingCycle === "yearly"
      ? "연 ₩82,800 (30% 할인)"
      : "연간 결제 시 ₩6,900/월 (30% 할인)";

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "홈", item: "https://domainchecker.co.kr" },
              { "@type": "ListItem", position: 2, name: "요금제", item: "https://domainchecker.co.kr/pricing" },
            ],
          }),
        }}
      />
      {/* Hero */}
      <section className="text-center">
        <div className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-4 py-1.5 text-xs font-medium text-primary">
          <Sparkles className="h-3.5 w-3.5" />
          구독 전용 플랫폼
        </div>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          도메인 분석,{" "}
          <span className="bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
            딱 하나의 요금제
          </span>
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
          도메인체커는{" "}
          <strong className="text-foreground">구독 기반 도메인 분석 플랫폼</strong>
          입니다. 무료 체험으로 시작하고, Pro 구독으로 모든 SEO 데이터에 무제한
          접근하세요.
        </p>
        <p className="mx-auto mt-2 max-w-lg text-sm text-muted-foreground/80">
          7일 이내 무조건 환불 · 언제든 구독 취소 가능
        </p>
      </section>

      {/* Billing Toggle */}
      <div className="mt-10 flex items-center justify-center gap-3">
        <span
          className={`text-sm font-medium ${billingCycle === "monthly" ? "text-foreground" : "text-muted-foreground"}`}
        >
          월간
        </span>
        <button
          type="button"
          role="switch"
          aria-checked={billingCycle === "yearly"}
          onClick={() =>
            setBillingCycle((c) => (c === "monthly" ? "yearly" : "monthly"))
          }
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
            billingCycle === "yearly" ? "bg-primary" : "bg-muted-foreground/30"
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-transform ${
              billingCycle === "yearly" ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </button>
        <span
          className={`text-sm font-medium ${billingCycle === "yearly" ? "text-foreground" : "text-muted-foreground"}`}
        >
          연간
          <span className="ml-1.5 rounded-full bg-green-500/10 px-2 py-0.5 text-xs text-green-600 dark:text-green-400">
            30% 할인
          </span>
        </span>
      </div>

      {/* Pricing Cards */}
      <div className="mt-10 grid gap-8 sm:grid-cols-2">
        {/* Free Card */}
        <div className="rounded-2xl border border-border/60 p-5 sm:p-8">
          <div className="mb-2 flex items-center gap-2">
            <Zap className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-xl font-bold">Free</h2>
          </div>
          <p className="text-sm text-muted-foreground">기본 도메인 분석 도구</p>
          <div className="mt-6">
            <span className="text-3xl font-bold sm:text-4xl">₩0</span>
            <span className="ml-1 text-muted-foreground">/월</span>
          </div>
          <div className="mt-2 text-xs text-muted-foreground">
            회원가입 없이 바로 사용
          </div>

          <div className="mt-8 space-y-3">
            {FREE_FEATURES.map((f) => (
              <div key={f.text} className="flex items-start gap-2.5">
                {f.included ? (
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                ) : (
                  <X className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/40" />
                )}
                <span
                  className={`text-sm ${f.included ? "" : "text-muted-foreground/50"}`}
                >
                  {f.text}
                </span>
              </div>
            ))}
          </div>

          <Link
            href="/"
            className="mt-8 flex min-h-[44px] w-full items-center justify-center rounded-lg border border-border py-3 text-center text-sm font-medium transition-colors hover:bg-muted"
          >
            무료로 시작하기
          </Link>
        </div>

        {/* Pro Card */}
        <div className="relative rounded-2xl border-2 border-primary p-5 sm:p-8">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-xs font-semibold text-primary-foreground">
            추천
          </div>
          <div className="mb-2 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-bold">Pro</h2>
          </div>
          <p className="text-sm text-muted-foreground">모든 기능 무제한 사용</p>
          <div className="mt-6">
            <span className="text-3xl font-bold sm:text-4xl">
              ₩{monthlyPrice}
            </span>
            <span className="ml-1 text-muted-foreground">/월</span>
          </div>
          <div className="mt-2 text-xs text-muted-foreground">{yearlyNote}</div>

          <div className="mt-8 space-y-3">
            {PRO_FEATURES.map((f) => (
              <div key={f.text} className="flex items-start gap-2.5">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span className="text-sm">{f.text}</span>
              </div>
            ))}
          </div>

          <Link
            href="/login?redirect=/pricing"
            className="mt-8 flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg bg-primary py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            Pro 시작하기
          </Link>
          <p className="mt-2 text-center text-xs text-muted-foreground">
            7일 이내 무조건 환불 가능
          </p>
        </div>
      </div>

      {/* Feature Comparison Table */}
      <section className="mt-16">
        <h2 className="mb-8 text-center text-2xl font-bold">
          Free vs Pro 상세 비교
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="py-3 pr-4 text-left font-medium text-muted-foreground">
                  기능
                </th>
                <th className="w-28 py-3 text-center font-medium text-muted-foreground">
                  Free
                </th>
                <th className="w-28 py-3 text-center font-medium text-primary">
                  Pro
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {[
                { feature: "도메인 분석", free: "1일 5회", pro: "무제한" },
                { feature: "AI 도메인 생성기", free: "1일 3회", pro: "무제한" },
                { feature: "대량 분석", free: "5개, 1일 1회", pro: "100개, 무제한" },
                { feature: "도메인 비교", free: "2개", pro: "10개" },
                { feature: "기본 SEO 지표 (DA/PA/DR/TF/CF)", free: "✓", pro: "✓" },
                { feature: "Ahrefs 트래픽/키워드", free: "—", pro: "✓" },
                { feature: "Moz 스팸 점수", free: "—", pro: "✓" },
                { feature: "Majestic 참조 도메인", free: "—", pro: "✓" },
                { feature: "DNS/WHOIS/SSL/HTTP", free: "1일 10회", pro: "무제한" },
                { feature: "낙찰 이력", free: "최근 24시간", pro: "전체 이력" },
                { feature: "도메인 가치 평가", free: "기본", pro: "고도화 (SEO 기반)" },
                { feature: "광고", free: "있음", pro: "없음" },
              ].map((row) => (
                <tr key={row.feature}>
                  <td className="py-3 pr-4">{row.feature}</td>
                  <td className="py-3 text-center text-muted-foreground">
                    {row.free}
                  </td>
                  <td className="py-3 text-center font-medium">{row.pro}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* FAQ */}
      <section className="mt-16">
        <h2 className="mb-8 text-center text-2xl font-bold">자주 묻는 질문</h2>
        <div className="divide-y rounded-lg border">
          {FAQ_ITEMS.map((item, i) => (
            <details key={i} className="group">
              <summary className="flex cursor-pointer items-center justify-between px-5 py-4 text-sm font-medium hover:bg-muted/50 [&::-webkit-details-marker]:hidden">
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

      {/* CTA */}
      <section className="mt-16 text-center">
        <div className="rounded-2xl border border-border/60 bg-muted/30 px-6 py-12 sm:px-12">
          <h2 className="text-2xl font-bold sm:text-3xl">
            지금 바로 시작하세요
          </h2>
          <p className="mx-auto mt-3 max-w-md text-muted-foreground">
            무료 플랜으로 도메인 분석을 체험하고, 더 깊은 데이터가 필요할 때
            Pro로 업그레이드하세요.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/"
              className="inline-flex min-h-[44px] items-center rounded-lg border border-border px-6 py-2.5 text-sm font-medium transition-colors hover:bg-muted"
            >
              무료로 시작하기
            </Link>
            <Link
              href="/login?redirect=/pricing"
              className="inline-flex min-h-[44px] items-center rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              Pro 시작하기
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ JSON-LD */}
      <Script
        id="pricing-faq-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: FAQ_ITEMS.map((item) => ({
              "@type": "Question",
              name: item.q,
              acceptedAnswer: { "@type": "Answer", text: item.a },
            })),
          }),
        }}
      />
    </div>
  );
}
