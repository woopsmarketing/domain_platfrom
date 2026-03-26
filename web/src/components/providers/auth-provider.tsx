"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

type AuthContextType = {
  user: User | null;
  loading: boolean;
  tier: "free" | "pro";
  tierLoading: boolean;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  tier: "free",
  tierLoading: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [tier, setTier] = useState<"free" | "pro">("free");
  const [tierLoading, setTierLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    // 현재 세션 확인
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setLoading(false);
    });

    // 인증 상태 변경 리스너
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // tier 조회
  useEffect(() => {
    if (!user) {
      setTier("free");
      setTierLoading(false);
      return;
    }

    const supabase = createClient();
    supabase
      .from("subscriptions")
      .select("tier, expires_at")
      .eq("user_id", user.id)
      .single()
      .then(({ data }) => {
        if (data && data.tier === "pro") {
          // expires_at이 미래인지 확인
          if (!data.expires_at || new Date(data.expires_at) > new Date()) {
            setTier("pro");
          } else {
            setTier("free");
          }
        } else {
          setTier("free");
        }
        setTierLoading(false);
      });
  }, [user]);

  // tier가 변경되면 localStorage도 동기화 (기존 isPro() 호환)
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("subscription_tier", tier);
    }
  }, [tier]);

  return (
    <AuthContext value={{ user, loading, tier, tierLoading }}>
      {children}
    </AuthContext>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
