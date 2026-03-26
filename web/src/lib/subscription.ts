/**
 * 구독 상태 관리 유틸리티
 *
 * 현재: localStorage 기반 (테스트용)
 * 추후: Supabase Auth + subscriptions 테이블 연동
 */

export type SubscriptionTier = "free" | "pro";

const STORAGE_KEY = "subscription_tier";

export function getSubscriptionTier(): SubscriptionTier {
  if (typeof window === "undefined") return "free";
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored === "pro" ? "pro" : "free";
}

export function setSubscriptionTier(tier: SubscriptionTier): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, tier);
}

export function isPro(): boolean {
  return getSubscriptionTier() === "pro";
}

/**
 * 일일 사용량 제한 체크
 * @param key 도구 식별자 (예: "bulk_analysis", "domain_analysis")
 * @param freeLimit 무료 제한 횟수
 * @returns { allowed: boolean, used: number, limit: number }
 */
export function checkDailyLimit(
  key: string,
  freeLimit: number
): { allowed: boolean; used: number; limit: number } {
  if (isPro()) return { allowed: true, used: 0, limit: Infinity };

  const today = new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const storageKey = `usage_${key}_${today}`;
  const used = parseInt(localStorage.getItem(storageKey) ?? "0", 10);

  return { allowed: used < freeLimit, used, limit: freeLimit };
}

export function incrementDailyUsage(key: string): void {
  if (isPro()) return;

  const today = new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const storageKey = `usage_${key}_${today}`;
  const used = parseInt(localStorage.getItem(storageKey) ?? "0", 10);
  localStorage.setItem(storageKey, String(used + 1));
}

/** Pro 전용 지표 필드 목록 */
export const PRO_ONLY_FIELDS = [
  "ahrefsTraffic",
  "ahrefsTrafficValue",
  "ahrefsOrganicKeywords",
  "mozLinks",
  "mozSpam",
  "majesticLinks",
  "majesticRefDomains",
] as const;

/** 무료 사용자에게 보이는 지표인지 확인 */
export function isFreeTierField(field: string): boolean {
  return !(PRO_ONLY_FIELDS as readonly string[]).includes(field);
}
