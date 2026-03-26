"use client";

import { useState, useCallback, useMemo } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { checkDailyLimit, incrementDailyUsage } from "@/lib/subscription";

export function useRateLimit(key: string, freeLimit: number) {
  const { tier } = useAuth();
  const isPro = tier === "pro";
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [usageCount, setUsageCount] = useState(0);

  const checkAndIncrement = useCallback((): boolean => {
    if (isPro) return true;

    if (typeof window === "undefined") return false;

    const { allowed } = checkDailyLimit(key, freeLimit);
    if (!allowed) {
      setShowUpgrade(true);
      return false;
    }
    incrementDailyUsage(key);
    setUsageCount((c) => c + 1);
    return true;
  }, [key, freeLimit, isPro]);

  const check = useCallback((): boolean => {
    if (isPro) return true;
    if (typeof window === "undefined") return false;
    const { allowed } = checkDailyLimit(key, freeLimit);
    if (!allowed) {
      setShowUpgrade(true);
      return false;
    }
    return true;
  }, [key, freeLimit, isPro]);

  const remaining = useMemo(() => {
    if (isPro) return Infinity;
    if (typeof window === "undefined") return freeLimit;
    const { used } = checkDailyLimit(key, freeLimit);
    return Math.max(0, freeLimit - used);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, freeLimit, isPro, usageCount]);

  return {
    isPro,
    showUpgrade,
    setShowUpgrade,
    checkAndIncrement,
    check,
    remaining,
  };
}
