"use client";

import { useState, useEffect } from "react";
import { getSubscriptionTier, setSubscriptionTier } from "@/lib/subscription";

/**
 * 개발/테스트용 Pro 모드 토글.
 * 프로덕션에서는 숨기거나 제거할 것.
 */
export function ProToggle() {
  const [tier, setTier] = useState<"free" | "pro">("free");

  useEffect(() => {
    setTier(getSubscriptionTier());
  }, []);

  const toggle = () => {
    const next = tier === "free" ? "pro" : "free";
    setSubscriptionTier(next);
    setTier(next);
    window.location.reload();
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 rounded-lg border bg-card p-3 shadow-lg">
      <div className="flex items-center gap-3">
        <span className="text-xs text-muted-foreground">테스트 모드</span>
        <button
          onClick={toggle}
          className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
            tier === "pro"
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground"
          }`}
        >
          {tier === "pro" ? "Pro" : "Free"}
        </button>
      </div>
    </div>
  );
}
