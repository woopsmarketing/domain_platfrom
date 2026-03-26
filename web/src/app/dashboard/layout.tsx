"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import {
  LayoutDashboard,
  History,
  Heart,
  MessageSquare,
  ShoppingBag,
  Bell,
  CreditCard,
  Settings,
} from "lucide-react";

const sidebarItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "대시보드" },
  { href: "/dashboard/history", icon: History, label: "분석 이력" },
  { href: "/dashboard/favorites", icon: Heart, label: "즐겨찾기" },
  { href: "/dashboard/inquiries", icon: MessageSquare, label: "내 문의" },
  { href: "/dashboard/purchases", icon: ShoppingBag, label: "구매 내역" },
  { href: "/dashboard/notifications", icon: Bell, label: "알림" },
  { href: "/dashboard/plan", icon: CreditCard, label: "내 플랜" },
  { href: "/dashboard/settings", icon: Settings, label: "프로필 설정" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login?redirect=/dashboard");
    }
  }, [loading, user, router]);

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 md:flex-row lg:px-8">
      {/* 데스크탑 사이드바 */}
      <aside className="hidden w-60 shrink-0 md:block">
        <nav className="sticky top-20 flex flex-col gap-1">
          {sidebarItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* 모바일 가로 스크롤 탭 */}
      <div className="md:hidden">
        <nav className="-mx-4 flex gap-1 overflow-x-auto px-4 pb-2 scrollbar-none">
          {sidebarItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
              >
                <item.icon className="h-3.5 w-3.5 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* 메인 콘텐츠 */}
      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}
