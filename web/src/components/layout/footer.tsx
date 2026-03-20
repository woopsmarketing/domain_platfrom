import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border/60 bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          {/* Brand */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2.5">
              <svg width="24" height="24" viewBox="0 0 32 32" fill="none" className="shrink-0 text-primary">
                <circle cx="13" cy="13" r="10" stroke="currentColor" strokeWidth="2.5" />
                <line x1="20.5" y1="20.5" x2="29" y2="29" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
              <span className="text-base font-semibold">도메인체커</span>
            </div>
            <p className="max-w-xs text-sm text-muted-foreground">
              도메인 투자자를 위한 무료 분석 도구.
              <br />
              DA, DR, Whois, 거래 이력을 즉시 확인.
            </p>
          </div>

          {/* Links */}
          <div className="flex gap-12">
            <div className="flex flex-col gap-2.5">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                서비스
              </p>
              <nav className="flex flex-col gap-2">
                <Link href="/" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                  도메인 분석
                </Link>
                <Link href="/market-history" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                  낙찰 이력
                </Link>
                <Link href="/tools" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                  분석 도구
                </Link>
              </nav>
            </div>
            <div className="flex flex-col gap-2.5">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                리소스
              </p>
              <nav className="flex flex-col gap-2">
                <Link href="/blog" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                  블로그
                </Link>
                <Link href="/blog/what-is-da" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                  DA란?
                </Link>
                <Link href="/blog/domain-auction-guide" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                  경매 가이드
                </Link>
              </nav>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-10 border-t border-border/60 pt-6">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} 도메인체커. 무료 도메인 분석 서비스.
          </p>
        </div>
      </div>
    </footer>
  );
}
