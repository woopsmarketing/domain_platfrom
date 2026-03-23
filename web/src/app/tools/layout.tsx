import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "분석 도구 — 벌크 분석, 도메인 비교, TLD 통계",
  description:
    "도메인 벌크 분석, 도메인 비교, TLD별 통계를 한 곳에서 확인하세요. 무료 도메인 분석 도구 모음.",
  keywords: [
    "도메인 벌크 분석",
    "도메인 비교",
    "TLD 통계",
    "도메인 분석 도구",
  ],
  openGraph: {
    title: "분석 도구 — 벌크 분석, 도메인 비교, TLD 통계",
    description: "도메인 벌크 분석, 비교, TLD별 통계를 한 곳에서 확인하세요.",
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
