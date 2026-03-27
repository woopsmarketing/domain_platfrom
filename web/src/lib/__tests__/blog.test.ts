import { describe, it, expect } from "vitest";
import { articles, CATEGORY_COLORS } from "@/lib/blog";

describe("blog", () => {
  it("articles가 최신순으로 정렬되어 있음", () => {
    for (let i = 0; i < articles.length - 1; i++) {
      expect(new Date(articles[i].date).getTime()).toBeGreaterThanOrEqual(
        new Date(articles[i + 1].date).getTime()
      );
    }
  });

  it("모든 article에 필수 필드가 있음", () => {
    articles.forEach((a) => {
      expect(a.slug).toBeTruthy();
      expect(a.title).toBeTruthy();
      expect(a.description).toBeTruthy();
      expect(a.category).toBeTruthy();
      expect(a.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(a.readTime).toBeTruthy();
    });
  });

  it("모든 카테고리에 색상이 정의되어 있음", () => {
    const categories = new Set(articles.map((a) => a.category));
    categories.forEach((cat) => {
      expect(CATEGORY_COLORS[cat]).toBeTruthy();
    });
  });
});
