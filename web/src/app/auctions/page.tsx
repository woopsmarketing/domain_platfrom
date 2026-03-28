import type { Metadata } from "next";
import { AuctionPageClient } from "@/components/home/auction-page-client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "실시간 도메인 경매 — 진행 중인 경매 도메인 목록 | 도메인체커",
  description:
    "현재 진행 중인 도메인 경매를 실시간으로 확인하세요. 경매 도메인 입찰가, 남은 시간, 입찰 수를 한눈에 파악합니다.",
  keywords: [
    "도메인 경매", "실시간 도메인 경매", "경매 도메인", "도메인 입찰",
    "만료 도메인 구매", "도메인 경매 사이트", "도메인 경매 현황",
    "경매도메인 확인", "경매도메인 분석", "경매도메인 점수 확인",
    "만료도메인 검색", "만료도메인 찾기", "드롭도메인 조회",
  ],
  openGraph: {
    title: "실시간 도메인 경매 — 진행 중인 경매 도메인 목록 | 도메인체커",
    description: "현재 진행 중인 도메인 경매를 실시간으로 확인하세요.",
    type: "website",
    siteName: "도메인체커",
  },
};

export default function AuctionsPage() {
  return <AuctionPageClient />;
}
