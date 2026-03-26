"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { Search, Menu, X, LogOut, CreditCard, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/components/providers/auth-provider";
import { createClient } from "@/lib/supabase/client";

const navItems = [
  { href: "/", label: "도메인 분석" },
  { href: "/auctions", label: "실시간 경매" },
  { href: "/market-history", label: "낙찰 이력" },
  { href: "/tools", label: "분석 도구" },
  { href: "/blog", label: "블로그" },
];

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

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

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setProfileMenuOpen(false);
    router.refresh();
  };

  // 메뉴 외부 클릭 시 닫기
  useEffect(() => {
    if (!mobileMenuOpen && !profileMenuOpen) return;
    const handler = (e: MouseEvent) => {
      if (mobileMenuOpen && menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMobileMenuOpen(false);
      }
      if (profileMenuOpen && profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [mobileMenuOpen, profileMenuOpen]);

  const userInitial = user?.email?.charAt(0).toUpperCase() ?? "?";

  return (
    <header ref={menuRef} className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-7xl items-center px-4 sm:h-16 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="mr-4 flex items-center gap-2 lg:mr-8" aria-label="도메인체커 홈">
          <svg width="28" height="28" viewBox="0 0 32 32" fill="none" className="shrink-0 text-primary">
            <circle cx="13" cy="13" r="10" stroke="currentColor" strokeWidth="2.5" />
            <line x1="20.5" y1="20.5" x2="29" y2="29" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
          <span className="text-base font-semibold tracking-tight sm:text-lg">
            도메인체커
          </span>
        </Link>

        {/* Navigation — 데스크탑 */}
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

        {/* Search — 데스크탑만 표시 */}
        <form
          onSubmit={handleSearch}
          className="mx-4 hidden flex-1 items-center justify-end md:flex"
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

        {/* Auth — 데스크탑 */}
        <div className="hidden items-center md:flex">
          {loading ? (
            <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
          ) : user ? (
            <div ref={profileRef} className="relative">
              <button
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground transition-opacity hover:opacity-80"
                aria-label="프로필 메뉴"
              >
                {userInitial}
              </button>
              {profileMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 rounded-lg border border-border/60 bg-card p-1 shadow-lg">
                  <div className="px-3 py-2 text-sm text-muted-foreground truncate">
                    {user.email}
                  </div>
                  <div className="my-1 h-px bg-border" />
                  <Link
                    href="/account"
                    onClick={() => setProfileMenuOpen(false)}
                    className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent transition-colors"
                  >
                    <User className="h-4 w-4" />
                    내 계정
                  </Link>
                  <Link
                    href="/pricing"
                    onClick={() => setProfileMenuOpen(false)}
                    className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent transition-colors"
                  >
                    <CreditCard className="h-4 w-4" />
                    요금제
                  </Link>
                  <div className="my-1 h-px bg-border" />
                  <button
                    onClick={handleSignOut}
                    className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent transition-colors text-destructive"
                  >
                    <LogOut className="h-4 w-4" />
                    로그아웃
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link href="/login">
              <Button variant="ghost" size="sm">
                로그인
              </Button>
            </Link>
          )}
        </div>

        {/* 모바일 오른쪽 여백 채우기 */}
        <div className="flex-1 md:hidden" />

        {/* Mobile auth + menu toggle */}
        <div className="flex items-center gap-1 md:hidden">
          {loading ? (
            <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
          ) : user ? (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
              {userInitial}
            </div>
          ) : (
            <Link href="/login">
              <Button variant="ghost" size="sm" className="text-xs">
                로그인
              </Button>
            </Link>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="ml-1"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="메뉴"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={`overflow-hidden border-t border-border/60 bg-background transition-all duration-200 ease-in-out md:hidden ${
          mobileMenuOpen ? "max-h-[500px] opacity-100" : "max-h-0 border-t-0 opacity-0"
        }`}
      >
        <nav className="flex flex-col gap-1 px-4 pb-4 pt-2">
          {navItems.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
              >
                <Button
                  variant="ghost"
                  className={`w-full justify-start text-sm ${
                    isActive ? "bg-accent text-foreground" : ""
                  }`}
                >
                  {item.label}
                </Button>
              </Link>
            );
          })}

          {/* 모바일: 로그인 상태에 따른 추가 항목 */}
          {!loading && user && (
            <>
              <div className="my-1 h-px bg-border" />
              <div className="px-3 py-2 text-sm text-muted-foreground truncate">
                {user.email}
              </div>
              <Link href="/account" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="ghost" className="w-full justify-start text-sm">
                  <User className="mr-2 h-4 w-4" />
                  내 계정
                </Button>
              </Link>
              <Link href="/pricing" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="ghost" className="w-full justify-start text-sm">
                  <CreditCard className="mr-2 h-4 w-4" />
                  요금제
                </Button>
              </Link>
              <button
                onClick={() => { handleSignOut(); setMobileMenuOpen(false); }}
                className="flex w-full items-center rounded-md px-4 py-2 text-sm text-destructive hover:bg-accent transition-colors"
              >
                <LogOut className="mr-2 h-4 w-4" />
                로그아웃
              </button>
            </>
          )}

          {/* 모바일 검색 */}
          <form onSubmit={(e) => { handleSearch(e); setMobileMenuOpen(false); }} className="mt-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="도메인 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="rounded-lg border-border/60 bg-muted/50 pl-9 placeholder:text-muted-foreground/70 focus:bg-background"
              />
            </div>
          </form>
        </nav>
      </div>
    </header>
  );
}
