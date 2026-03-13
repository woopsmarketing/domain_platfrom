"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, ShoppingCart, Clock, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "/mypage", label: "내 정보", icon: User },
  { href: "/mypage/wishlist", label: "관심 목록", icon: Heart },
  { href: "/mypage/cart", label: "장바구니", icon: ShoppingCart },
  { href: "/mypage/history", label: "구매 이력", icon: Clock },
];

export default function MypageLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
      <h1 className="mb-4 text-2xl font-bold">마이페이지</h1>
      <div className="flex flex-col gap-6 md:flex-row">
        <nav className="flex gap-1 md:w-48 md:flex-col">
          {tabs.map((tab) => (
            <Link key={tab.href} href={tab.href}>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "w-full justify-start",
                  pathname === tab.href && "bg-muted"
                )}
              >
                <tab.icon className="mr-2 h-4 w-4" />
                {tab.label}
              </Button>
            </Link>
          ))}
        </nav>
        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
}
