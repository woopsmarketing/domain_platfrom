import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "무료 도메인 분석 도구 모음 · 도메인 체크 · 백링크 · DNS · WHOIS | 도메인체커",
  description:
    "도메인 분석, 백링크 확인, DNS 조회, WHOIS 조회, SSL 점검 등 10가지 무료 웹사이트 분석 툴을 제공합니다. SEO 분석을 한 곳에서.",
  keywords: [
    "웹사이트 분석 툴", "SEO 분석 툴", "도메인 체크 툴", "무료 SEO 분석 툴",
    "사이트 분석 툴", "도메인 분석 도구", "백링크 확인 도구",
    "도메인 비교", "도메인 대량 분석", "도메인 이름 검색", "도메인 검색기",
  ],
  openGraph: {
    title: "무료 도메인 분석 도구 모음 · 도메인 체크 · 백링크 · DNS | 도메인체커",
    description: "도메인 분석, 백링크 확인, DNS 조회 등 10가지 무료 웹사이트 분석 툴.",
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
