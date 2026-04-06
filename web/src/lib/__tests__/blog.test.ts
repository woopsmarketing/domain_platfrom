import { describe, it, expect } from "vitest";
import { CATEGORY_COLORS, CATEGORIES } from "@/lib/blog";

describe("blog", () => {
  it("모든 카테고리에 색상이 정의되어 있음", () => {
    CATEGORIES.forEach((cat) => {
      expect(CATEGORY_COLORS[cat]).toBeTruthy();
    });
  });
});
