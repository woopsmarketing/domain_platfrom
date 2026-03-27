"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { useFetch } from "@/hooks/use-fetch";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type PurchaseItem = {
  id: string;
  domain_name: string;
  price_usd: number;
  status: string;
  purchased_at: string;
  notes: string | null;
};

type PurchasesResponse = {
  items: PurchaseItem[];
};

const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "outline" }> = {
  pending: { label: "결제 대기", variant: "secondary" },
  paid: { label: "결제 완료", variant: "default" },
  transferring: { label: "이전 중", variant: "secondary" },
  completed: { label: "완료", variant: "default" },
  cancelled: { label: "취소", variant: "outline" },
};

export default function PurchasesPage() {
  const { data, loading } = useFetch<PurchasesResponse>("/api/dashboard/purchases", { cacheTime: 120000 });
  const items = data?.items ?? [];

  const getStatusInfo = (status: string) => statusMap[status] ?? { label: status, variant: "outline" as const };

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-bold">구매 내역</h1>

      {loading ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <ShoppingBag className="mx-auto mb-3 h-8 w-8 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">구매 내역이 없습니다.</p>
            <Link href="/marketplace">
              <Button variant="outline" size="sm" className="mt-3">
                프리미엄 도메인 보기 →
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="divide-y divide-border/60">
              {items.map((item) => {
                const statusInfo = getStatusInfo(item.status);
                return (
                  <div key={item.id} className="flex items-center justify-between px-4 py-3">
                    <div className="flex flex-col gap-1">
                      <Link
                        href={`/domain/${item.domain_name}`}
                        className="text-sm font-semibold text-primary hover:underline"
                      >
                        {item.domain_name}
                      </Link>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          ${item.price_usd?.toLocaleString() ?? 0}
                        </span>
                        <Badge variant={statusInfo.variant} className="text-xs">
                          {statusInfo.label}
                        </Badge>
                      </div>
                    </div>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {new Date(item.purchased_at).toLocaleDateString("ko-KR")}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
