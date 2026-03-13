"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search, Globe, Heart, ShoppingCart, User, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function Header() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/domain/${searchQuery.trim().toLowerCase()}`);
      setSearchQuery("");
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-7xl items-center px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="mr-4 flex items-center gap-2 font-bold lg:mr-6">
          <Globe className="h-5 w-5 text-primary" />
          <span className="hidden sm:inline">DomainPulse</span>
        </Link>

        {/* Navigation */}
        <nav className="hidden items-center gap-1 md:flex">
          <Link href="/">
            <Button variant="ghost" size="sm">도메인 탐색</Button>
          </Link>
          <Link href="/marketplace">
            <Button variant="ghost" size="sm">도메인 상점</Button>
          </Link>
        </nav>

        {/* Search */}
        <form onSubmit={handleSearch} className="mx-4 flex flex-1 items-center justify-center">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="도메인 검색 (예: theverge.com)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </form>

        {/* Actions */}
        <div className="hidden items-center gap-1 md:flex">
          <Link href="/mypage/wishlist">
            <Button variant="ghost" size="icon" aria-label="관심 목록">
              <Heart className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/mypage/cart">
            <Button variant="ghost" size="icon" aria-label="장바구니">
              <ShoppingCart className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/auth/login">
            <Button variant="outline" size="sm" className="ml-2">
              <User className="mr-1 h-4 w-4" />
              로그인
            </Button>
          </Link>
        </div>

        {/* Mobile menu toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="메뉴"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="border-t bg-background px-4 pb-4 pt-2 md:hidden">
          <nav className="flex flex-col gap-1">
            <Link href="/" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="ghost" size="sm" className="w-full justify-start">
                도메인 탐색
              </Button>
            </Link>
            <Link href="/marketplace" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="ghost" size="sm" className="w-full justify-start">
                도메인 상점
              </Button>
            </Link>
            <Link href="/mypage/wishlist" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="ghost" size="sm" className="w-full justify-start">
                <Heart className="mr-2 h-4 w-4" /> 관심 목록
              </Button>
            </Link>
            <Link href="/mypage/cart" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="ghost" size="sm" className="w-full justify-start">
                <ShoppingCart className="mr-2 h-4 w-4" /> 장바구니
              </Button>
            </Link>
            <Link href="/auth/login" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="outline" size="sm" className="mt-2 w-full">
                <User className="mr-2 h-4 w-4" /> 로그인
              </Button>
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
