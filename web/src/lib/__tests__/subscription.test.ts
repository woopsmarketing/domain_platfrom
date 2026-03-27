import { describe, it, expect, beforeEach } from "vitest";

// localStorage mock
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value; },
    clear: () => { store = {}; },
    removeItem: (key: string) => { delete store[key]; },
    get length() { return Object.keys(store).length; },
    key: (index: number) => Object.keys(store)[index] || null,
  };
})();
Object.defineProperty(global, "localStorage", { value: localStorageMock });

import {
  checkDailyLimit,
  incrementDailyUsage,
  isPro,
  getSubscriptionTier,
  PRO_ONLY_FIELDS,
  isFreeTierField,
} from "@/lib/subscription";

describe("subscription", () => {
  beforeEach(() => localStorageMock.clear());

  it("기본 tier는 free", () => {
    expect(getSubscriptionTier()).toBe("free");
    expect(isPro()).toBe(false);
  });

  it("checkDailyLimit — 한도 내", () => {
    const result = checkDailyLimit("test_tool", 3);
    expect(result.allowed).toBe(true);
    expect(result.used).toBe(0);
    expect(result.limit).toBe(3);
  });

  it("incrementDailyUsage 후 카운트 증가", () => {
    incrementDailyUsage("test_tool");
    incrementDailyUsage("test_tool");
    const result = checkDailyLimit("test_tool", 3);
    expect(result.used).toBe(2);
    expect(result.allowed).toBe(true);
  });

  it("한도 초과 시 allowed false", () => {
    incrementDailyUsage("test_tool");
    incrementDailyUsage("test_tool");
    incrementDailyUsage("test_tool");
    const result = checkDailyLimit("test_tool", 3);
    expect(result.allowed).toBe(false);
  });

  it("PRO_ONLY_FIELDS에 포함된 필드는 Free가 아님", () => {
    expect(isFreeTierField("ahrefsTraffic")).toBe(false);
    expect(isFreeTierField("mozSpam")).toBe(false);
  });

  it("일반 필드는 Free tier", () => {
    expect(isFreeTierField("moz_da")).toBe(true);
    expect(isFreeTierField("ahrefs_dr")).toBe(true);
  });
});
