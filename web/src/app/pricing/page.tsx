import type { Metadata } from "next";
import Link from "next/link";
import { Check, X, Sparkles, Zap } from "lucide-react";

export const metadata: Metadata = {
  title: "요금제 — 무료 vs Pro 구독",
  description: "도메인체커 Pro 구독으로 무제한 분석, 전체 낙찰 이력, 고도화 가치 평가 등 모든 기능을 사용하세요.",
  keywords: ["도메인체커 요금제", "도메인 분석 Pro", "도메인 분석 구독"],
};

const FREE_FEATURES = [
  { text: "도메인 분석 (1일 5회)", included: true },
  { text: "AI 도메인 생성기 (1일 3회)", included: true },
  { text: "벌크 분석 (5개, 1일 1회)", included: true },
  { text: "도메인 비교 (2개)", included: true },
  { text: "기본 지표 (DA/PA/DR/TF/CF)", included: true },
  { text: "백링크 수, 참조 도메인, Wayback", included: true },
  { text: "DNS/WHOIS/SSL/HTTP 도구", included: true },
  { text: "낙찰 이력 (24시간 데이터)", included: true },
  { text: "트래픽, 트래픽 가치, 키워드", included: false },
  { text: "Moz Links, 스팸 점수", included: false },
  { text: "Majestic Links, 참조 도메인", included: false },
  { text: "전체 낙찰 이력 (낙찰가/입찰수)", included: false },
  { text: "고도화 도메인 가치 평가", included: false },
  { text: "벌크 분석 (100개, 무제한)", included: false },
  { text: "광고 없음", included: false },
];

const PRO_FEATURES = [
  { text: "도메인 분석 무제한", included: true },
  { text: "AI 도메인 생성기 무제한", included: true },
  { text: "벌크 분석 (100개, 무제한)", included: true },
  { text: "도메인 비교 (10개)", included: true },
  { text: "기본 지표 (DA/PA/DR/TF/CF)", included: true },
  { text: "백링크 수, 참조 도메인, Wayback", included: true },
  { text: "DNS/WHOIS/SSL/HTTP 도구 무제한", included: true },
  { text: "낙찰 이력 전체 데이터", included: true },
  { text: "트래픽, 트래픽 가치($), 키워드", included: true },
  { text: "Moz Links, 스팸 점수", included: true },
  { text: "Majestic Links, 참조 도메인", included: true },
  { text: "전체 낙찰 이력 (낙찰가/입찰수)", included: true },
  { text: "고도화 도메인 가치 평가 (SEO 데이터)", included: true },
  { text: "벌크 분석 (100개, 무제한)", included: true },
  { text: "광고 없음", included: true },
];

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-16">
      {/* Hero */}
      <section className="text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          심플한{" "}
          <span className="bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
            요금제
          </span>
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
          무료로 시작하고, 더 많은 데이터가 필요할 때 Pro로 업그레이드하세요.
        </p>
      </section>

      {/* Pricing Cards */}
      <div className="mt-12 grid gap-8 sm:grid-cols-2">
        {/* Free */}
        <div className="rounded-2xl border border-border/60 p-8">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-xl font-bold">Free</h2>
          </div>
          <p className="text-sm text-muted-foreground">기본 도메인 분석 도구</p>
          <div className="mt-6">
            <span className="text-4xl font-bold">₩0</span>
            <span className="text-muted-foreground ml-1">/월</span>
          </div>
          <div className="mt-2 text-xs text-muted-foreground">회원가입 없이 바로 사용</div>

          <div className="mt-8 space-y-3">
            {FREE_FEATURES.map((f) => (
              <div key={f.text} className="flex items-start gap-2.5">
                {f.included ? (
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                ) : (
                  <X className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/40" />
                )}
                <span className={`text-sm ${f.included ? "" : "text-muted-foreground/50"}`}>
                  {f.text}
                </span>
              </div>
            ))}
          </div>

          <Link
            href="/"
            className="mt-8 block w-full rounded-lg border border-border py-3 text-center text-sm font-medium transition-colors hover:bg-muted"
          >
            무료로 시작하기
          </Link>
        </div>

        {/* Pro */}
        <div className="relative rounded-2xl border-2 border-primary p-8">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-xs font-semibold text-primary-foreground">
            추천
          </div>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-bold">Pro</h2>
          </div>
          <p className="text-sm text-muted-foreground">모든 기능 무제한 사용</p>
          <div className="mt-6">
            <span className="text-4xl font-bold">₩9,900</span>
            <span className="text-muted-foreground ml-1">/월</span>
          </div>
          <div className="mt-2 text-xs text-muted-foreground">연간 결제 시 ₩6,900/월 (30% 할인)</div>

          <div className="mt-8 space-y-3">
            {PRO_FEATURES.map((f) => (
              <div key={f.text} className="flex items-start gap-2.5">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span className="text-sm">{f.text}</span>
              </div>
            ))}
          </div>

          <button
            disabled
            className="mt-8 block w-full rounded-lg bg-primary py-3 text-center text-sm font-medium text-primary-foreground opacity-80 cursor-not-allowed"
          >
            곧 출시 예정
          </button>
          <p className="mt-2 text-xs text-center text-muted-foreground">
            결제 시스템 준비 중입니다
          </p>
        </div>
      </div>

      {/* FAQ */}
      <section className="mt-16">
        <h2 className="text-2xl font-bold text-center mb-8">자주 묻는 질문</h2>
        <div className="divide-y rounded-lg border">
          {[
            { q: "무료로 어떤 기능을 사용할 수 있나요?", a: "도메인 분석(1일 5회), AI 도메인 생성기(1일 3회), 벌크 분석(5개, 1일 1회), 기본 SEO 지표(DA/PA/DR/TF/CF), 백링크 수, 참조 도메인, Wayback 스냅샷, DNS/WHOIS/SSL/HTTP 도구를 무료로 사용할 수 있습니다." },
            { q: "Pro 구독은 언제 출시되나요?", a: "현재 결제 시스템을 준비 중이며, 곧 출시할 예정입니다. 출시 시 별도 안내드리겠습니다." },
            { q: "연간 결제 할인이 있나요?", a: "네, 연간 결제 시 월 ₩6,900으로 약 30% 할인됩니다 (연 ₩82,800)." },
            { q: "환불 정책은 어떻게 되나요?", a: "Pro 구독은 7일 이내 무조건 환불이 가능합니다." },
          ].map((item, i) => (
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
