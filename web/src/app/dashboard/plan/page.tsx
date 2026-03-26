"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Check, X, Sparkles } from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type Subscription = {
  tier: string;
  plan_type: string | null;
  expires_at: string | null;
  cancel_at: string | null;
  lemon_customer_id: string | null;
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

const PRO_FEATURES = [
  "도메인 분석 무제한",
  "AI 도메인 생성기 무제한",
  "대량 분석 (100개, 무제한)",
  "도메인 비교 (10개)",
  "Ahrefs 트래픽, 트래픽 가치, 키워드",
  "Moz Links, 스팸 점수",
  "Majestic Links, 참조 도메인",
  "전체 낙찰 이력 열람",
  "고도화 도메인 가치 평가",
  "DNS/WHOIS/SSL/HTTP 무제한",
];

const FREE_LIMITS = [
  "도메인 분석 1일 5회",
  "AI 생성기 1일 3회",
  "대량 분석 1일 1회 (5개)",
  "도메인 비교 2개",
  "기본 지표만 (DA/PA/DR/TF/CF)",
  "낙찰 이력 최근 24시간만",
];

export default function PlanPage() {
  const { user, tier, tierLoading } = useAuth();
  const [sub, setSub] = useState<Subscription | null>(null);
  const [subLoading, setSubLoading] = useState(true);
  const [portalLoading, setPortalLoading] = useState(false);
  const [portalError, setPortalError] = useState("");

  useEffect(() => {
    if (!user) return;
    const fetchSub = async () => {
      try {
        // TODO: 클라이언트 직접 조회 대신 서버 API로 이전 권장 (현재 RLS 미적용으로 보안 위험 낮음)
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
    setPortalError("");
    try {
      const res = await fetch("/api/customer-portal", { method: "POST" });
      const data = await res.json();
      if (data.url && data.url.startsWith("https://") && data.url.includes("lemonsqueezy")) {
        window.open(data.url, "_blank");
      } else {
        setPortalError("구독 관리 페이지를 열 수 없습니다.");
      }
    } catch {
      setPortalError("구독 관리 페이지를 열 수 없습니다.");
    } finally {
      setPortalLoading(false);
    }
  };

  const isPro = tier === "pro";

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-bold">내 플랜</h1>

      {/* 현재 구독 정보 */}
      <Card>
        <CardContent className="p-6">
          <h2 className="mb-4 text-base font-semibold">구독 정보</h2>
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
                <div className="flex flex-col gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full sm:w-fit"
                    onClick={handleCustomerPortal}
                    disabled={portalLoading}
                  >
                    {portalLoading ? "로딩 중..." : "구독 관리"}
                  </Button>
                  {portalError && (
                    <p className="text-sm text-destructive">{portalError}</p>
                  )}
                </div>
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
        </CardContent>
      </Card>

      {/* 기능 목록 */}
      <Card>
        <CardContent className="p-6">
          <h2 className="mb-4 text-base font-semibold">
            {isPro ? "Pro 플랜 기능" : "Free 플랜 제한"}
          </h2>
          {isPro ? (
            <div className="grid gap-2 sm:grid-cols-2">
              {PRO_FEATURES.map((text) => (
                <div key={text} className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 shrink-0 text-primary" />
                  <span>{text}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="grid gap-2 sm:grid-cols-2">
                {FREE_LIMITS.map((text) => (
                  <div key={text} className="flex items-center gap-2 text-sm">
                    <X className="h-4 w-4 shrink-0 text-muted-foreground/50" />
                    <span className="text-muted-foreground">{text}</span>
                  </div>
                ))}
              </div>
              <div className="mt-2 rounded-lg border border-primary/20 bg-primary/5 p-3">
                <p className="text-sm font-medium">
                  Pro로 업그레이드하면 모든 기능을 무제한으로 사용할 수 있습니다
                </p>
                <Link href="/pricing" className="mt-2 inline-block">
                  <Button size="sm">요금제 비교하기</Button>
                </Link>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
