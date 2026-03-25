import type { Metadata } from "next";
import { DomainCompare } from "@/components/tools/domain-compare";

export const metadata: Metadata = {
  title: "도메인 비교 분석 — 어떤 도메인이 더 좋을까?",
  description:
    "2~3개 도메인을 나란히 비교하여 검색 점수, 백링크, 트래픽, 스팸 점수를 한눈에 파악하세요. 도메인 구매 결정에 도움이 됩니다.",
  keywords: [
    "도메인 비교", "도메인 비교 분석", "도메인 비교 도구", "도메인 비교 사이트",
    "도메인 점수 비교", "도메인 어떤게 좋을까",
  ],
};

export default function DomainComparePage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <section className="text-center mb-10">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          도메인{" "}
          <span className="bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
            비교 분석
          </span>
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
          2~3개 도메인을 나란히 비교하여 어떤 도메인이 더 좋은지 한눈에 파악하세요.
          검색 점수, 백링크, 트래픽, 스팸 점수를 비교합니다.
        </p>
      </section>
      <DomainCompare />
    </div>
  );
}
