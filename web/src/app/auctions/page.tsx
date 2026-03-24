import type { Metadata } from "next";
import { AuctionPageClient } from "@/components/home/auction-page-client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "도메인 경매 현황 — 지금 입찰 가능한 인기 도메인",
  description:
    "현재 활발하게 경쟁 중인 도메인 경매를 실시간으로 확인하세요. 입찰수, 남은 시간, 현재 가격을 한눈에 파악. 좋은 도메인을 저렴하게 구매할 기회.",
  keywords: [
    "도메인 경매", "도메인 입찰", "만료 도메인 구매", "도메인 경매 사이트", "도메인 경매 현황",
    "저렴한 도메인 구매", "도메인 경매 방법", "경매도메인 확인", "경매도메인 추천",
    "경매도메인 리스트", "경매도메인 잘고르는 법", "경매도메인 분석", "경매도메인 점수 확인",
    "만료도메인 검색", "만료도메인 찾기", "드롭도메인 조회",
  ],
  openGraph: {
    title: "도메인 경매 현황 — 지금 입찰 가능한 인기 도메인",
    description: "실시간 도메인 경매 현황. 좋은 도메인을 저렴하게 구매할 기회를 잡으세요.",
    type: "website",
    siteName: "도메인체커",
  },
};

export default function AuctionsPage() {
  return <AuctionPageClient />;
}
