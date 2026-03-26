"use client";

import { Suspense, useCallback, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Check, X, Sparkles, Zap, Loader2, CheckCircle } from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";

const FREE_FEATURES = [
  { text: "도메인 분석 (1일 5회)", included: true },
  { text: "AI 도메인 생성기 (1일 3회)", included: true },
  { text: "벌크 분석 (5개, 1일 1회)", included: true },
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
  { text: "벌크 분석 (100개, 무제한 횟수)", included: true },
  { text: "도메인 비교 (10개)", included: true },
  {
    text: "모든 SEO 지표 (DA/PA/DR/TF/CF + 트래픽/키워드/스팸)",
    included: true,
  },
  { text: "Moz Links, 스팸 점수 확인", included: true },
  { text: "Ahrefs 트래픽, 트래픽 가치($), 키워드", included: true },
  { text: "Majestic Links, 참조 도메인", included: true },
  { text: "DNS/WHOIS/SSL/HTTP 도구 무제한", included: true },
  { text: "전체 낙찰 이력 (낙찰가/입찰수/낙찰일)", included: true },
  { text: "고도화 도메인 가치 평가 (SEO 데이터 기반)", included: true },
  { text: "광고 없음", included: true },
];

function PricingContent() {
  const { user, loading, tier, tierLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const success = searchParams.get("success") === "true";

  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">(
    "monthly"
  );
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const isProUser = tier === "pro";

  const handleCheckout = useCallback(async () => {
    if (!user) {
      router.push("/login?redirect=/pricing");
      return;
    }

    setCheckoutLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: billingCycle }),
      });

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert("결제 페이지를 열 수 없습니다. 잠시 후 다시 시도해주세요.");
      }
    } catch {
      alert("결제 처리 중 오류가 발생했습니다.");
    } finally {
      setCheckoutLoading(false);
    }
  }, [user, billingCycle, router]);

  const monthlyPrice = billingCycle === "yearly" ? "6,900" : "9,900";
  const yearlyNote =
    billingCycle === "yearly" ? "연 ₩82,800 (30% 할인)" : "연간 결제 시 ₩6,900/월 (30% 할인)";

  return (
    <div className="mx-auto max-w-5xl px-4 py-16">
      {/* Success Banner */}
      {success && (
        <div className="mb-8 flex items-center gap-3 rounded-lg border border-green-500/30 bg-green-500/10 px-5 py-4">
          <CheckCircle className="h-5 w-5 shrink-0 text-green-500" />
          <div>
            <p className="font-medium text-green-700 dark:text-green-400">
              Pro 구독이 활성화되었습니다!
            </p>
            <p className="text-sm text-green-600/80 dark:text-green-400/70">
              모든 Pro 기능을 바로 사용할 수 있습니다.
            </p>
          </div>
        </div>
      )}

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
        {/* Free */}
        <div className="rounded-2xl border border-border/60 p-8">
          <div className="mb-2 flex items-center gap-2">
            <Zap className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-xl font-bold">Free</h2>
          </div>
          <p className="text-sm text-muted-foreground">기본 도메인 분석 도구</p>
          <div className="mt-6">
            <span className="text-4xl font-bold">₩0</span>
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
          <div className="mb-2 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-bold">Pro</h2>
          </div>
          <p className="text-sm text-muted-foreground">모든 기능 무제한 사용</p>
          <div className="mt-6">
            <span className="text-4xl font-bold">₩{monthlyPrice}</span>
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

          {loading || tierLoading ? (
            <div className="mt-8 flex w-full items-center justify-center rounded-lg bg-primary py-3 opacity-70">
              <Loader2 className="h-4 w-4 animate-spin text-primary-foreground" />
            </div>
          ) : isProUser ? (
            <div className="mt-8 w-full rounded-lg border-2 border-primary/50 bg-primary/5 py-3 text-center text-sm font-medium text-primary">
              현재 Pro 구독 중입니다
            </div>
          ) : (
            <button
              onClick={handleCheckout}
              disabled={checkoutLoading}
              className="mt-8 flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-70"
            >
              {checkoutLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  처리 중...
                </>
              ) : (
                "Pro 시작하기"
              )}
            </button>
          )}

          {!isProUser && !loading && !tierLoading && (
            <p className="mt-2 text-center text-xs text-muted-foreground">
              7일 이내 무조건 환불 가능
            </p>
          )}
        </div>
      </div>

      {/* FAQ */}
      <section className="mt-16">
        <h2 className="mb-8 text-center text-2xl font-bold">
          자주 묻는 질문
        </h2>
        <div className="divide-y rounded-lg border">
          {[
            {
              q: "무료로 어떤 기능을 사용할 수 있나요?",
              a: "도메인 분석(1일 5회), AI 도메인 생성기(1일 3회), 벌크 분석(5개, 1일 1회), 기본 SEO 지표(DA/PA/DR/TF/CF), 백링크 수, 참조 도메인, Wayback 스냅샷, DNS/WHOIS/SSL/HTTP 도구를 무료로 사용할 수 있습니다.",
            },
            {
              q: "연간 결제 할인이 있나요?",
              a: "네, 연간 결제 시 월 ₩6,900으로 약 30% 할인됩니다 (연 ₩82,800).",
            },
            {
              q: "환불 정책은 어떻게 되나요?",
              a: "Pro 구독은 7일 이내 무조건 환불이 가능합니다.",
            },
            {
              q: "구독을 취소하면 어떻게 되나요?",
              a: "구독을 취소해도 현재 결제 기간이 끝날 때까지 Pro 기능을 계속 사용할 수 있습니다.",
            },
          ].map((item, i) => (
            <details key={i} className="group">
              <summary className="flex cursor-pointer items-center justify-between px-5 py-4 text-sm font-medium hover:bg-muted/50">
                {item.q}
              </summary>
              <div className="px-5 pb-4 text-sm text-muted-foreground">
                {item.a}
              </div>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}

export default function PricingPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <PricingContent />
    </Suspense>
  );
}
