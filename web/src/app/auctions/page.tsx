import type { Metadata } from "next";
import { AuctionPageClient } from "@/components/home/auction-page-client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "실시간 경매 도메인 — 인기 경매 현황",
  description:
    "현재 활발하게 입찰 경쟁이 진행 중인 도메인 경매 현황을 실시간으로 확인하세요. 입찰수, 남은 시간, 현재 가격을 한눈에 파악.",
  keywords: [
    "도메인 경매",
    "실시간 경매",
    "도메인 입찰",
    "도메인 경매 현황",
    "인기 경매 도메인",
  ],
  openGraph: {
    title: "실시간 경매 도메인 — 인기 경매 현황",
    description: "현재 활발하게 입찰 경쟁이 진행 중인 도메인 경매 현황을 실시간으로 확인하세요.",
    type: "website",
    siteName: "도메인체커",
  },
};

export default function AuctionsPage() {
  return <AuctionPageClient />;
}
