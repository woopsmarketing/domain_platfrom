/**
 * 블로그 메타데이터 — 단일 소스 (Single Source of Truth)
 *
 * 새 블로그 글 추가 시 이 배열에만 추가하면:
 * - /blog 목록 페이지에 자동 표시
 * - sitemap.xml에 자동 등록
 * - 최신순 자동 정렬
 */

export interface BlogArticle {
  slug: string;
  title: string;
  description: string;
  category: BlogCategory;
  date: string; // YYYY-MM-DD
  readTime: string;
}

export type BlogCategory = "SEO 분석" | "도메인 투자" | "SEO 기초";

export const CATEGORY_COLORS: Record<BlogCategory, string> = {
  "SEO 분석": "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  "도메인 투자": "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  "SEO 기초": "bg-purple-500/10 text-purple-600 dark:text-purple-400",
};

// 최신순 정렬 — 새 글은 맨 위에 추가
export const articles: BlogArticle[] = [
  {
    slug: "domain-spam-score-check",
    title: "도메인 스팸 점수 확인 방법 — 내 도메인이 스팸으로 분류되고 있는지 점검하기",
    description:
      "도메인 스팸 점수(Spam Score)가 무엇인지, 왜 높아지는지, 어떻게 확인하고 낮출 수 있는지 실무 기준으로 정리했습니다.",
    category: "SEO 분석",
    date: "2026-03-26",
    readTime: "8분",
  },
  {
    slug: "domain-auction-guide",
    title: "도메인 경매 완벽 가이드 — GoDaddy, Namecheap 낙찰 데이터 활용법",
    description:
      "도메인 경매의 작동 방식과 도메인체커 낙찰 데이터를 활용해 투자 기회를 찾는 방법을 소개합니다.",
    category: "도메인 투자",
    date: "2026-03-20",
    readTime: "6분",
  },
  {
    slug: "how-to-choose-domain",
    title: "좋은 도메인 고르는 법 — 투자 가치 있는 도메인 5가지 기준",
    description:
      "DA/DR, TLD, 도메인 나이, 백링크, 브랜드 가능성 등 수익성 높은 도메인을 고르는 5가지 핵심 기준을 정리합니다.",
    category: "도메인 투자",
    date: "2026-03-15",
    readTime: "5분",
  },
  {
    slug: "what-is-da",
    title: "Domain Authority(DA)란? 도메인 품질을 판단하는 핵심 지표",
    description:
      "Moz가 개발한 DA 지표의 의미, 계산 방식, 도메인 투자에서 DA가 중요한 이유를 알아봅니다.",
    category: "SEO 기초",
    date: "2026-03-10",
    readTime: "4분",
  },
];
