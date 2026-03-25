import type { Metadata } from "next";
import { BulkAnalysis } from "@/components/tools/bulk-analysis";

export const metadata: Metadata = {
  title: "도메인 벌크 분석 — 여러 도메인 한번에 분석",
  description:
    "최대 10개 도메인을 한번에 입력하면 각 도메인의 검색 점수, 백링크, 신뢰도를 일괄 분석합니다. 도메인 투자 전 대량 스크리닝에 활용하세요.",
  keywords: [
    "도메인 벌크 분석", "도메인 대량 분석", "도메인 일괄 분석", "여러 도메인 분석",
    "도메인 대량 조회", "도메인 일괄 조회", "도메인 스크리닝",
  ],
};

export default function BulkAnalysisPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <section className="text-center mb-10">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          도메인{" "}
          <span className="bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
            벌크 분석
          </span>
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
          여러 도메인을 한번에 입력하면 각각의 검색 점수, 백링크, 신뢰도를 일괄 분석합니다.
          도메인 투자 전 대량 스크리닝에 활용하세요.
        </p>
      </section>
      <BulkAnalysis />
    </div>
  );
}
