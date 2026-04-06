/**
 * 블로그 타입 정의 + 카테고리 색상 매핑
 *
 * 콘텐츠 데이터는 Supabase posts 테이블이 단일 소스(Single Source of Truth).
 * 이 파일은 타입과 UI 상수만 관리한다.
 */

export type BlogCategory = "SEO 분석" | "도메인 투자" | "SEO 기초";

export const CATEGORY_COLORS: Record<BlogCategory, string> = {
  "SEO 분석": "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  "도메인 투자": "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  "SEO 기초": "bg-purple-500/10 text-purple-600 dark:text-purple-400",
};

export const CATEGORIES: BlogCategory[] = ["SEO 분석", "도메인 투자", "SEO 기초"];
