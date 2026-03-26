import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "요금제 — 무료 vs Pro 구독",
  description:
    "도메인체커 Pro 구독으로 무제한 분석, 전체 낙찰 이력, 고도화 가치 평가 등 모든 기능을 사용하세요.",
  keywords: ["도메인체커 요금제", "도메인 분석 Pro", "도메인 분석 구독"],
};

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
