import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export function CtaSection() {
  return (
    <section className="px-4 py-20">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-2xl font-bold sm:text-3xl">
          지금 바로 도메인을 분석해 보세요
        </h2>
        <p className="mt-3 text-muted-foreground">
          완전 무료, 회원가입 없이 즉시 사용 가능합니다.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link href="/tools">
            <Badge variant="secondary" className="cursor-pointer rounded-full px-5 py-2.5 text-sm min-h-[44px] inline-flex items-center transition-colors hover:bg-primary hover:text-primary-foreground">
              벌크 분석 도구
            </Badge>
          </Link>
          <Link href="/market-history">
            <Badge variant="secondary" className="cursor-pointer rounded-full px-5 py-2.5 text-sm min-h-[44px] inline-flex items-center transition-colors hover:bg-primary hover:text-primary-foreground">
              낙찰 이력 검색
            </Badge>
          </Link>
          <Link href="/blog">
            <Badge variant="secondary" className="cursor-pointer rounded-full px-5 py-2.5 text-sm min-h-[44px] inline-flex items-center transition-colors hover:bg-primary hover:text-primary-foreground">
              도메인 투자 가이드
            </Badge>
          </Link>
        </div>
      </div>
    </section>
  );
}
