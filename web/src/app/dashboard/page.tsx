import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, Heart, MessageSquare, CreditCard, ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect=/dashboard");

  const client = createServiceClient();
  const email = user.email;

  const [searchesRes, favoritesRes, inquiriesRes, subscriptionRes, historyRes] = await Promise.all([
    client.from("user_searches").select("id", { count: "exact", head: true }).eq("user_id", user.id),
    client.from("wishlists").select("id", { count: "exact", head: true }).eq("user_id", user.id),
    email
      ? client.from("broker_inquiries").select("id", { count: "exact", head: true }).eq("email", email)
      : Promise.resolve({ count: 0 }),
    client.from("subscriptions").select("tier").eq("user_id", user.id).maybeSingle(),
    client
      .from("user_searches")
      .select("id, domain_name, searched_at")
      .eq("user_id", user.id)
      .order("searched_at", { ascending: false })
      .limit(5),
  ]);

  const stats = {
    searches: searchesRes.count ?? 0,
    favorites: favoritesRes.count ?? 0,
    inquiries: inquiriesRes.count ?? 0,
    plan: subscriptionRes.data?.tier ?? "free",
  };

  const recentHistory = historyRes.data ?? [];
  const userName = user.email?.split("@")[0] ?? "사용자";

  const statCards = [
    { label: "총 분석", value: stats.searches, icon: Search, color: "text-blue-500" },
    { label: "즐겨찾기", value: stats.favorites, icon: Heart, color: "text-pink-500" },
    { label: "문의", value: stats.inquiries, icon: MessageSquare, color: "text-green-500" },
    { label: "플랜", value: stats.plan === "free" ? "Free" : "Pro", icon: CreditCard, color: "text-amber-500" },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* 환영 메시지 */}
      <div>
        <h1 className="text-2xl font-bold">{userName}님, 안녕하세요</h1>
        <p className="text-sm text-muted-foreground">대시보드에서 분석 현황을 확인하세요.</p>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {statCards.map((card) => (
          <Card key={card.label}>
            <CardContent className="flex items-center gap-3 p-4">
              <div className={`rounded-lg bg-muted p-2 ${card.color}`}>
                <card.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{card.value}</p>
                <p className="text-xs text-muted-foreground">{card.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 최근 분석 */}
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold">최근 분석</h2>
            <Link href="/dashboard/history">
              <Button variant="ghost" size="sm" className="gap-1 text-xs">
                전체 보기 <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </div>
          {recentHistory.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-sm text-muted-foreground">아직 분석 기록이 없습니다.</p>
              <Link href="/">
                <Button variant="outline" size="sm" className="mt-3">
                  도메인 분석 시작하기
                </Button>
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              {recentHistory.map((item) => (
                <Link
                  key={item.id}
                  href={`/domain/${item.domain_name}`}
                  className="flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent"
                >
                  <span className="font-medium">{item.domain_name}</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(item.searched_at).toLocaleDateString("ko-KR")}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 빠른 액션 */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Link href="/">
          <Card className="transition-colors hover:bg-accent/50">
            <CardContent className="flex items-center gap-3 p-4">
              <Search className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-semibold">도메인 분석하기</p>
                <p className="text-xs text-muted-foreground">DA, DR, Whois 등 종합 분석</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/marketplace">
          <Card className="transition-colors hover:bg-accent/50">
            <CardContent className="flex items-center gap-3 p-4">
              <Heart className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-semibold">프리미엄 도메인 보기</p>
                <p className="text-xs text-muted-foreground">엄선된 프리미엄 도메인 목록</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
