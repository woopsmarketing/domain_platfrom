"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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

type RecentSearch = {
  id: number;
  name: string;
  tld: string;
  last_searched_at: string;
};

const USAGE_LIMITS: Record<string, { key: string; label: string; limit: number }> = {
  domain: { key: "usage_domain_analysis", label: "도메인 분석", limit: 5 },
  ai: { key: "usage_ai_generator", label: "AI 생성기", limit: 3 },
  bulk: { key: "usage_bulk_analysis", label: "벌크 분석", limit: 1 },
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

function getUsageCount(key: string): number {
  if (typeof window === "undefined") return 0;
  const today = new Date().toISOString().slice(0, 10);
  const raw = localStorage.getItem(key);
  if (!raw) return 0;
  try {
    const parsed = JSON.parse(raw);
    if (parsed.date === today) return parsed.count ?? 0;
  } catch {
    // old format or invalid
  }
  return 0;
}

export default function AccountPage() {
  const router = useRouter();
  const { user, loading, tier, tierLoading } = useAuth();
  const [sub, setSub] = useState<Subscription | null>(null);
  const [subLoading, setSubLoading] = useState(true);
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);
  const [portalLoading, setPortalLoading] = useState(false);

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login?redirect=/account");
    }
  }, [loading, user, router]);

  // Fetch subscription data
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

  // Fetch recent searches
  useEffect(() => {
    if (!user) return;
    fetch("/api/recent-searches")
      .then((r) => r.json())
      .then((d) => setRecentSearches(d.items ?? []))
      .catch(() => {});
  }, [user]);

  const handleCustomerPortal = async () => {
    setPortalLoading(true);
    try {
      const res = await fetch("/api/customer-portal", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.open(data.url, "_blank");
      }
    } catch {
      // ignore
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
        {/* Section 1: Profile */}
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

        {/* Section 2: Subscription */}
        <div className="rounded-xl border border-border/60 bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold">구독 정보</h2>
          {subLoading || tierLoading ? (
            <div className="h-6 w-32 animate-pulse rounded bg-muted" />
          ) : isPro ? (
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">현재 플랜:</span>
                <span className="rounded-full bg-primary/10 px-3 py-0.5 text-sm font-semibold text-primary">
                  Pro
                </span>
              </div>
              {sub?.plan_type && (
                <p className="text-sm text-muted-foreground">
                  플랜 타입: {sub.plan_type === "monthly" ? "월간" : "연간"}
                </p>
              )}
              {sub?.expires_at && (
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
                  className="w-fit"
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
                <Button size="sm" className="w-fit">
                  Pro로 업그레이드
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Section 3: Usage (Free only) */}
        <div className="rounded-xl border border-border/60 bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold">오늘의 사용량</h2>
          {isPro ? (
            <p className="text-sm text-muted-foreground">Pro 플랜 — 무제한</p>
          ) : (
            <div className="flex flex-col gap-4">
              {Object.values(USAGE_LIMITS).map(({ key, label, limit }) => {
                const count = getUsageCount(key);
                const pct = Math.min((count / limit) * 100, 100);
                return (
                  <div key={key}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span>{label}</span>
                      <span className="text-muted-foreground">
                        {count}/{limit}회
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Section 4: Recent Searches */}
        <div className="rounded-xl border border-border/60 bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold">최근 검색 히스토리</h2>
          {recentSearches.length === 0 ? (
            <p className="text-sm text-muted-foreground">검색 기록이 없습니다.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {recentSearches.map((item) => (
                <li key={item.id}>
                  <Link
                    href={`/domain/${item.name}${item.tld ? "." + item.tld : ""}`}
                    className="flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent"
                  >
                    <span className="font-medium text-primary">
                      {item.name}{item.tld ? "." + item.tld : ""}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {item.last_searched_at ? formatDate(item.last_searched_at) : ""}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Section 5: Account Actions */}
        <div className="rounded-xl border border-border/60 bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold">계정 관리</h2>
          <div className="flex flex-wrap gap-3">
            <Link href="/account/change-password">
              <Button variant="outline" size="sm">
                비밀번호 변경
              </Button>
            </Link>
            <Button variant="outline" size="sm" onClick={handleSignOut} className="text-destructive">
              로그아웃
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
