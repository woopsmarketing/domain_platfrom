import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "구독 요금제 · 도메인 분석 구독 플랜 · Free vs Pro | 도메인체커",
  description:
    "도메인체커는 구독 전용 도메인 분석 플랫폼입니다. 무료 체험으로 시작하고, Pro 구독(월 ₩9,900)으로 무제한 분석, 전체 백링크 데이터, 경매 낙찰 이력, Ahrefs 트래픽 데이터에 접근하세요.",
  keywords: [
    "도메인 분석 구독", "도메인 분석 요금제", "도메인 분석 Pro 구독",
    "도메인 분석 가격", "도메인 분석 플랜", "SEO 분석 구독",
    "도메인체커 요금", "도메인 분석 월간 구독",
  ],
  openGraph: {
    title: "구독 요금제 · 도메인 분석 구독 플랜 | 도메인체커",
    description: "구독 전용 도메인 분석 플랫폼. 무료 체험 후 Pro 구독으로 모든 SEO 데이터 무제한 접근.",
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
