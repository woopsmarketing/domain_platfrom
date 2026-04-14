"use client";
import Link from "next/link";
import { trackEvent } from "@/lib/gtag";

interface Props {
  source: string;
  variant?: "hero" | "inline";
}

export function MarketplaceCtaBanner({ source, variant = "inline" }: Props) {
  return (
    <Link
      href="/marketplace"
      onClick={() => trackEvent("marketplace_click", { source })}
      className={
        variant === "hero"
          ? "group mt-6 flex items-center justify-between rounded-2xl border border-purple-200 bg-gradient-to-r from-purple-50 via-white to-indigo-50 px-6 py-5 shadow-sm transition hover:border-purple-400 hover:shadow-md md:mt-8"
          : "group flex items-center justify-between rounded-2xl border border-purple-200 bg-gradient-to-r from-purple-50 via-white to-indigo-50 px-6 py-5 shadow-sm transition hover:border-purple-400 hover:shadow-md"
      }
    >
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 text-2xl">
          💎
        </div>
        <div>
          <div className="text-xs font-medium uppercase tracking-wide text-purple-600">
            프리미엄 도메인 마켓
          </div>
          <div className="text-base font-semibold text-gray-900 md:text-lg">
            엄선된 프리미엄 도메인 102개 — 지금 구매 가능
          </div>
          <div className="mt-0.5 hidden text-sm text-gray-600 md:block">
            DA · DR · 백링크 지표가 검증된 SEO용 도메인만 선별했습니다
          </div>
        </div>
      </div>
      <div className="hidden shrink-0 items-center gap-1 rounded-full bg-purple-600 px-4 py-2 text-sm font-semibold text-white transition group-hover:bg-purple-700 md:flex">
        둘러보기
        <span aria-hidden>→</span>
      </div>
    </Link>
  );
}
