import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "요금제 · 무료 도메인 분석 vs Pro 구독 | 도메인체커",
  description:
    "무료로 도메인 분석을 시작하세요. Pro 구독으로 무제한 분석, 전체 백링크 데이터, 경매 낙찰 이력을 확인할 수 있습니다.",
  keywords: [
    "무료 도메인 분석", "도메인 분석 툴", "도메인 분석 Pro",
    "도메인 분석 요금", "도메인 분석 가격",
  ],
  openGraph: {
    title: "요금제 · 무료 도메인 분석 vs Pro 구독 | 도메인체커",
    description: "무료로 도메인 분석을 시작하세요. Pro 구독으로 무제한 분석.",
    type: "website",
    siteName: "도메인체커",
  },
};

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
