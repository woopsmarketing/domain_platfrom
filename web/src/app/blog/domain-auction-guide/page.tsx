import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "도메인 경매 완벽 가이드 — GoDaddy, Namecheap 낙찰 데이터 활용법 — 도메인체커",
  description:
    "도메인 경매의 작동 방식부터 GoDaddy Auctions, Namecheap 경매 낙찰 데이터를 활용해 투자 기회를 찾는 방법까지. 도메인 경매 입문자를 위한 완벽 가이드.",
  keywords: [
    "도메인 경매",
    "GoDaddy 도메인 경매",
    "Namecheap 경매",
    "도메인 낙찰 데이터",
    "만료 도메인 경매",
    "도메인 투자",
    "도메인 경매 가이드",
  ],
};

export default function DomainAuctionGuidePage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-16">
      <Link
        href="/blog"
        className="mb-8 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> 블로그 목록
      </Link>

      <h1 className="text-3xl font-bold tracking-tight leading-tight">
        도메인 경매 완벽 가이드 — GoDaddy, Namecheap 낙찰 데이터 활용법
      </h1>

      <div className="mt-8 space-y-8 text-base leading-relaxed text-muted-foreground">
        <section>
          <h2 className="mb-3 text-xl font-semibold text-foreground">
            도메인 경매란?
          </h2>
          <p>
            도메인 경매는 등록 기간이 만료되었거나 소유자가 매각을 원하는 도메인을 입찰
            방식으로 거래하는 시스템입니다. GoDaddy Auctions, Namecheap Marketplace,
            NameJet, DropCatch 등 다양한 플랫폼에서 매일 수천 개의 도메인이 경매에
            올라옵니다. 만료 도메인 경매의 경우, 기존 도메인의 백링크와 검색엔진 신뢰도를
            그대로 승계할 수 있어 도메인 투자자와 SEO 전문가에게 큰 관심을 받고 있습니다.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-foreground">
            주요 도메인 경매 플랫폼
          </h2>
          <p>
            <strong className="text-foreground">GoDaddy Auctions</strong>는 세계 최대의
            도메인 경매 플랫폼으로, 매일 수만 개의 도메인이 거래됩니다. 만료 도메인 경매와
            사용자 등록 경매를 모두 지원하며, 7일 입찰 방식이 기본입니다.{" "}
            <strong className="text-foreground">Namecheap Marketplace</strong>는 비교적
            저렴한 수수료와 직관적인 인터페이스로 초보 투자자에게 적합합니다. 두 플랫폼
            모두 낙찰가가 공개되어 시장 가격을 파악하는 데 유용합니다.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-foreground">
            도메인체커로 낙찰 데이터 활용하기
          </h2>
          <p>
            도메인체커는 GoDaddy와 Namecheap의 낙찰 완료 데이터를 매일 수집하여
            데이터베이스에 저장합니다. 이 데이터를 활용하면 다음과 같은 투자 판단이
            가능합니다.
          </p>
          <ul className="mt-3 list-disc space-y-2 pl-6">
            <li>
              <strong className="text-foreground">시세 파악:</strong> 특정 TLD나 키워드
              패턴의 도메인이 평균 얼마에 낙찰되는지 확인하여 입찰 상한선을 설정할 수
              있습니다.
            </li>
            <li>
              <strong className="text-foreground">가치 도메인 발굴:</strong> DA/DR이
              높으면서 낙찰가가 낮은 도메인을 찾아 저평가된 투자 기회를 포착할 수 있습니다.
            </li>
            <li>
              <strong className="text-foreground">트렌드 분석:</strong> 특정 산업 키워드
              도메인의 가격 추이를 확인하여 시장 동향을 파악할 수 있습니다.
            </li>
          </ul>
          <p className="mt-3">
            도메인의 SEO 지수(DA, DR, TF)와 낙찰 이력을 함께 분석하면, 단순히 도메인명만
            보고 입찰하는 것보다 훨씬 정확한 가치 판단이 가능합니다. 도메인체커의 도메인
            상세 페이지에서 Whois, SEO 지표, 거래 이력, Wayback 히스토리를 한 번에 확인해
            보세요.
          </p>
        </section>
      </div>

      <div className="mt-12 rounded-xl border bg-muted/30 p-6 text-center">
        <p className="text-lg font-semibold">경매 도메인의 가치를 분석해 보세요</p>
        <p className="mt-1 text-sm text-muted-foreground">
          도메인체커에서 DA, DR, TF, 거래 이력을 무료로 확인할 수 있습니다.
        </p>
        <Link
          href="/"
          className="mt-4 inline-flex items-center justify-center rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          도메인 분석하기
        </Link>
      </div>
    </article>
  );
}
