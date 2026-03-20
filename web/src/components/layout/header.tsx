"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";
import { Search, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const navItems = [
  { href: "/", label: "도메인 분석" },
  { href: "/market-history", label: "낙찰 이력" },
  { href: "/tools", label: "분석 도구" },
  { href: "/blog", label: "블로그" },
];

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      let domain = searchQuery.trim().toLowerCase();
      domain = domain.replace(/^https?:\/\//, "");
      domain = domain.replace(/^www\./, "");
      domain = domain.split("/")[0].split(":")[0];
      if (domain) {
        router.push(`/domain/${domain}`);
        setSearchQuery("");
      }
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="mr-6 flex items-center gap-2.5 lg:mr-8" aria-label="도메인체커 홈">
          <svg width="28" height="28" viewBox="0 0 32 32" fill="none" className="shrink-0 text-primary">
            <circle cx="13" cy="13" r="10" stroke="currentColor" strokeWidth="2.5" />
            <line x1="20.5" y1="20.5" x2="29" y2="29" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
          <span className="hidden text-lg font-semibold tracking-tight sm:inline">
            도메인체커
          </span>
        </Link>

        {/* Navigation */}
        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`text-sm font-medium ${
                    isActive
                      ? "bg-accent text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {item.label}
                </Button>
              </Link>
            );
          })}
        </nav>

        {/* Search */}
        <form
          onSubmit={handleSearch}
          className="mx-4 flex flex-1 items-center justify-end"
        >
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="도메인 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 rounded-lg border-border/60 bg-muted/50 pl-9 text-sm placeholder:text-muted-foreground/70 focus:bg-background"
            />
          </div>
        </form>

        {/* Mobile menu toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="ml-2 md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="메뉴"
        >
          {mobileMenuOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </Button>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="border-t border-border/60 bg-background px-4 pb-4 pt-2 md:hidden">
          <nav className="flex flex-col gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-sm"
                >
                  {item.label}
                </Button>
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
