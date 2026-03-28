import type { Metadata } from "next";
import Link from "next/link";
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
  return (
    <>
      <AuctionPageClient />

      {/* SEO 하단 콘텐츠 */}
      <section className="border-t bg-muted/30 px-4 py-12 sm:py-16">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-2xl font-bold mb-4">도메인 경매란?</h2>
          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <p>
              도메인 경매는 만료되었거나 소유자가 판매를 결정한 도메인을 입찰 방식으로
              거래하는 시장입니다. 이미 검색엔진에서 평판을 쌓은 도메인을 합리적인
              가격에 확보할 수 있어 SEO에 유리한 출발점을 제공합니다.
            </p>
            <p>
              경매 도메인의 가치는 도메인 점수, 백링크 품질, 과거 이력에 따라
              달라집니다. 입찰 전에 반드시 도메인 분석을 통해 핵심 지표를 확인하세요.
            </p>

            <h3 className="text-lg font-semibold text-foreground mt-6">경매 입찰 팁</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>입찰 전 도메인 점수(DA/DR)와 백링크를 확인하여 실제 가치를 파악하세요</li>
              <li>과거 이력(Wayback)을 반드시 조회하여 스팸 이력이 없는지 검증하세요</li>
              <li>낙찰 이력 페이지에서 비슷한 도메인의 거래 시세를 참고하세요</li>
              <li>종료 임박 시간대에 경쟁이 치열해지므로 예산 한도를 미리 정해두세요</li>
            </ul>

            <div className="mt-6 flex flex-wrap gap-4 text-sm">
              <Link href="/market-history" className="text-primary hover:underline">
                낙찰 이력 확인하기 →
              </Link>
              <Link href="/blog/domain-auction-guide" className="text-primary hover:underline">
                경매 가이드 읽기 →
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
