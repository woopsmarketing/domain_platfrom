import { Globe } from "lucide-react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t bg-muted/40">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-4 py-8 sm:flex-row sm:justify-between sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Globe className="h-4 w-4" />
          <span>DomainPulse</span>
          <span>&copy; {new Date().getFullYear()}</span>
        </div>
        <nav className="flex gap-4 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground transition-colors">도메인 분석</Link>
          <Link href="/market-history" className="hover:text-foreground transition-colors">낙찰 이력</Link>
          <Link href="/tools" className="hover:text-foreground transition-colors">분석 도구</Link>
          <Link href="/blog" className="hover:text-foreground transition-colors">블로그</Link>
        </nav>
      </div>
    </footer>
  );
}
