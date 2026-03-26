"use client";

import Link from "next/link";
import { Crown, Handshake, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ServiceCta() {
  return (
    <section className="border-t px-4 py-16">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-center text-2xl font-bold mb-2">도메인 거래 서비스</h2>
        <p className="text-center text-muted-foreground mb-10">
          검증된 프리미엄 도메인 구매부터 경매 대행까지, 전문 서비스를 제공합니다
        </p>
        <div className="grid gap-6 sm:grid-cols-2">
          {/* 프리미엄 도메인 판매 */}
          <div className="rounded-2xl border border-border/60 p-6 flex flex-col gap-4 hover:border-primary/40 transition-colors">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Crown className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">프리미엄 도메인 판매</h3>
              <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                SEO 지표가 검증된 프리미엄 도메인을 합리적인 가격에 제공합니다. 
                DA, DR, 백링크가 확인된 도메인으로 빠르게 시작하세요.
              </p>
            </div>
            <Link href="/marketplace" className="mt-auto">
              <Button variant="outline" className="w-full gap-2">
                판매 도메인 보기 <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          {/* 경매 대행 서비스 */}
          <div className="rounded-2xl border border-border/60 p-6 flex flex-col gap-4 hover:border-primary/40 transition-colors">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
              <Handshake className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">경매 도메인 대행</h3>
              <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                원하는 도메인을 찾아드립니다. 경매 입찰부터 도메인 이전까지 
                전 과정을 대행합니다. 24시간 내 연락드립니다.
              </p>
            </div>
            <Link href="/inquiry" className="mt-auto">
              <Button className="w-full gap-2">
                대행 문의하기 <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
