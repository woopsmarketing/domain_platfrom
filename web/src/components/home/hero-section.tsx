import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { DomainSearchBox } from "@/components/domain/domain-search-box";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden border-b px-4 py-24 sm:py-32 lg:py-40">
      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-primary/[0.03] via-transparent to-transparent" />
      <div className="pointer-events-none absolute -left-40 -top-40 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -right-40 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />

      <div className="relative mx-auto max-w-3xl text-center">
        <Badge variant="secondary" className="mb-6 rounded-full px-4 py-1.5 text-sm font-medium">
          완전 무료 — 회원가입 없이 즉시 사용
        </Badge>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
          도메인 지수를
          <br />
          <span className="bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
            무료로 분석하세요
          </span>
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
          도메인명만 입력하면 DA, DR, Trust Flow, Whois, 거래 이력을 즉시 분석합니다.
        </p>

        <div className="mt-10">
          <DomainSearchBox />
        </div>

        <div className="mt-4 flex items-center justify-center gap-4 text-sm text-muted-foreground">
          <span>예시:</span>
          {["theverge.com", "github.com", "shopify.com"].map((d) => (
            <Link
              key={d}
              href={`/domain/${d}`}
              className="rounded-md border border-border/60 px-2.5 py-1 transition-colors hover:border-primary/40 hover:text-foreground"
            >
              {d}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
