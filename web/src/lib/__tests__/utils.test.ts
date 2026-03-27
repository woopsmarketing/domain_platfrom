import { describe, it, expect } from "vitest";
import { formatDateKR, getTodayKST, formatPrice } from "@/lib/utils";

describe("formatDateKR", () => {
  it("한국어 날짜 포맷으로 변환", () => {
    const result = formatDateKR("2026-03-27");
    expect(result).toContain("2026");
    expect(result).toContain("3");
    expect(result).toContain("27");
  });
});

describe("getTodayKST", () => {
  it("YYYY-MM-DD 형식 반환", () => {
    const today = getTodayKST();
    expect(today).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe("formatPrice", () => {
  it("숫자를 달러 형식으로", () => {
    const result = formatPrice(1234);
    expect(result).toContain("1,234");
  });
});
