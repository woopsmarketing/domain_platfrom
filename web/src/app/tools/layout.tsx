import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "무료 도메인 도구 모음 — 도메인 비교 · 벌크 분석 · 이름 추천",
  description:
    "도메인 벌크 분석, 비교, TLD 통계, 이름 검색, AI 이름 추천까지. 도메인 구매와 관리에 필요한 모든 무료 도구를 한 곳에서 사용하세요.",
  keywords: [
    "도메인 도구", "도메인 비교", "도메인 벌크 분석", "도메인 이름 검색",
    "도메인 이름 추천", "TLD 통계", "무료 도메인 도구", "도메인 분석 툴",
    "도메인 점수 분석 툴", "백링크 분석 툴", "도메인 비교 분석 툴",
    "웹사이트 분석 툴", "도메인 검색기",
  ],
  openGraph: {
    title: "무료 도메인 도구 모음 — 비교 · 분석 · 이름 추천",
    description: "도메인 구매와 관리에 필요한 모든 무료 도구를 한 곳에서.",
    type: "website",
    siteName: "도메인체커",
  },
};

export default function ToolsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
