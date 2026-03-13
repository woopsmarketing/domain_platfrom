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
          <Link href="/" className="hover:text-foreground transition-colors">홈</Link>
          <Link href="/marketplace" className="hover:text-foreground transition-colors">도메인 상점</Link>
        </nav>
      </div>
    </footer>
  );
}
