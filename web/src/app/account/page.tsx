"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Check, X, Sparkles } from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

type Subscription = {
  tier: string;
  plan_type: string | null;
  expires_at: string | null;
  cancel_at: string | null;
  lemon_customer_id: string | null;
};

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function getProviderLabel(provider: string | undefined) {
  if (provider === "google") return "Google";
  if (provider === "email") return "이메일";
  return provider ?? "이메일";
}

const PRO_FEATURES = [
  { text: "도메인 분석 무제한", pro: true },
  { text: "AI 도메인 생성기 무제한", pro: true },
  { text: "대량 분석 (100개, 무제한)", pro: true },
  { text: "도메인 비교 (10개)", pro: true },
  { text: "Ahrefs 트래픽, 트래픽 가치, 키워드", pro: true },
  { text: "Moz Links, 스팸 점수", pro: true },
  { text: "Majestic Links, 참조 도메인", pro: true },
  { text: "전체 낙찰 이력 열람", pro: true },
  { text: "고도화 도메인 가치 평가", pro: true },
  { text: "DNS/WHOIS/SSL/HTTP 무제한", pro: true },
];

const FREE_LIMITS = [
  { text: "도메인 분석 1일 5회", pro: false },
  { text: "AI 생성기 1일 3회", pro: false },
  { text: "대량 분석 1일 1회 (5개)", pro: false },
  { text: "도메인 비교 2개", pro: false },
  { text: "기본 지표만 (DA/PA/DR/TF/CF)", pro: false },
  { text: "낙찰 이력 최근 24시간만", pro: false },
];

export default function AccountPage() {
  const router = useRouter();
  const { user, loading, tier, tierLoading } = useAuth();
  const [sub, setSub] = useState<Subscription | null>(null);
  const [subLoading, setSubLoading] = useState(true);
  const [portalLoading, setPortalLoading] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login?redirect=/account");
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (!user) return;
    const fetchSub = async () => {
      try {
        const supabase = createClient();
        const { data } = await supabase
          .from("subscriptions")
          .select("tier, plan_type, expires_at, cancel_at, lemon_customer_id")
          .eq("user_id", user.id)
          .maybeSingle();
        setSub(data);
      } catch {
        // ignore
      } finally {
        setSubLoading(false);
      }
    };
    fetchSub();
  }, [user]);

  const handleCustomerPortal = async () => {
    setPortalLoading(true);
    try {
      const res = await fetch("/api/customer-portal", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.open(data.url, "_blank");
      } else {
        alert("구독 관리 페이지를 열 수 없습니다. 스토어 활성화 후 이용 가능합니다.");
      }
    } catch {
      alert("구독 관리 페이지를 열 수 없습니다.");
    } finally {
      setPortalLoading(false);
    }
  };

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  if (loading || !user) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
      </div>
    );
  }

  const isPro = tier === "pro";

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <h1 className="mb-6 text-2xl font-bold">내 계정</h1>

      <div className="flex flex-col gap-6">
        {/* 프로필 */}
        <div className="rounded-xl border border-border/60 bg-card p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
              {user.email?.charAt(0).toUpperCase() ?? "?"}
            </div>
            <div className="min-w-0">
              <p className="truncate text-lg font-semibold">{user.email}</p>
              <p className="text-sm text-muted-foreground">
                가입일: {user.created_at ? formatDate(user.created_at) : "-"}
              </p>
              <p className="text-sm text-muted-foreground">
                로그인 방법: {getProviderLabel(user.app_metadata?.provider)}
              </p>
            </div>
          </div>
        </div>

        {/* 구독 정보 */}
        <div className="rounded-xl border border-border/60 bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold">구독 정보</h2>
          {subLoading || tierLoading ? (
            <div className="h-6 w-32 animate-pulse rounded bg-muted" />
          ) : isPro ? (
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">현재 플랜:</span>
                <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-0.5 text-sm font-semibold text-primary">
                  <Sparkles className="h-3.5 w-3.5" />
                  Pro
                </span>
              </div>
              {sub?.plan_type && (
                <p className="text-sm text-muted-foreground">
                  플랜 타입: {sub.plan_type === "monthly" ? "월간" : "연간"}
                </p>
              )}
              {sub?.expires_at && !sub?.cancel_at && (
                <p className="text-sm text-muted-foreground">
                  다음 결제일: {formatDate(sub.expires_at)}
                </p>
              )}
              {sub?.cancel_at && (
                <p className="text-sm text-amber-600">
                  해지 예정 — {formatDate(sub.cancel_at)}까지 사용 가능
                </p>
              )}
              {sub?.lemon_customer_id && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full sm:w-fit"
                  onClick={handleCustomerPortal}
                  disabled={portalLoading}
                >
                  {portalLoading ? "로딩 중..." : "구독 관리"}
                </Button>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">현재 플랜:</span>
                <span className="rounded-full bg-muted px-3 py-0.5 text-sm font-semibold">
                  Free
                </span>
              </div>
              <Link href="/pricing">
                <Button size="sm" className="w-full sm:w-fit">
                  Pro로 업그레이드
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* 내 플랜 기능 */}
        <div className="rounded-xl border border-border/60 bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold">
            {isPro ? "Pro 플랜 기능" : "Free 플랜 제한"}
          </h2>
          {isPro ? (
            <div className="grid gap-2 sm:grid-cols-2">
              {PRO_FEATURES.map((f) => (
                <div key={f.text} className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 shrink-0 text-primary" />
                  <span>{f.text}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="grid gap-2 sm:grid-cols-2">
                {FREE_LIMITS.map((f) => (
                  <div key={f.text} className="flex items-center gap-2 text-sm">
                    <X className="h-4 w-4 shrink-0 text-muted-foreground/50" />
                    <span className="text-muted-foreground">{f.text}</span>
                  </div>
                ))}
              </div>
              <div className="mt-2 rounded-lg border border-primary/20 bg-primary/5 p-3">
                <p className="text-sm font-medium">
                  Pro로 업그레이드하면 모든 기능을 무제한으로 사용할 수 있습니다
                </p>
                <Link href="/pricing" className="mt-2 inline-block">
                  <Button size="sm" className="h-11 text-sm">
                    요금제 비교하기
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* 계정 관리 */}
        <div className="rounded-xl border border-border/60 bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold">계정 관리</h2>
          <div className="flex flex-wrap gap-3">
            {user.app_metadata?.provider !== "google" && (
              <Link href="/account/change-password">
                <Button variant="outline" size="sm">
                  비밀번호 변경
                </Button>
              </Link>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleSignOut}
              className="text-destructive"
            >
              로그아웃
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
