"use client";

import { MessageSquare } from "lucide-react";
import { useFetch } from "@/hooks/use-fetch";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type InquiryItem = {
  id: string | number;
  type: "broker" | "inquiry";
  status: string;
  created_at: string;
  // broker fields
  target_keyword?: string;
  budget?: string;
  // inquiry fields
  listing_id?: string;
  offered_price_usd?: number;
  message?: string;
};

type InquiriesResponse = {
  items: InquiryItem[];
};

const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "outline" }> = {
  pending: { label: "대기", variant: "secondary" },
  replied: { label: "답변 완료", variant: "default" },
  closed: { label: "종료", variant: "outline" },
  resolved: { label: "해결", variant: "default" },
};

export default function InquiriesPage() {
  const { data, loading } = useFetch<InquiriesResponse>("/api/dashboard/inquiries", { cacheTime: 120000 });
  const items = data?.items ?? [];

  const getStatusInfo = (status: string) => statusMap[status] ?? { label: status, variant: "outline" as const };

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-bold">내 문의</h1>

      {loading ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <MessageSquare className="mx-auto mb-3 h-8 w-8 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">문의 내역이 없습니다.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-2">
          {items.map((item) => {
            const statusInfo = getStatusInfo(item.status);
            return (
              <Card key={`${item.type}-${item.id}`}>
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {item.type === "broker" ? "경매 대행" : "구매 문의"}
                      </Badge>
                      <Badge variant={statusInfo.variant} className="text-xs">
                        {statusInfo.label}
                      </Badge>
                    </div>
                    <p className="text-sm font-medium">
                      {item.type === "broker"
                        ? item.target_keyword ?? "키워드 미지정"
                        : item.message
                          ? item.message.slice(0, 50) + (item.message.length > 50 ? "..." : "")
                          : "메시지 없음"}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {new Date(item.created_at).toLocaleDateString("ko-KR")}
                  </span>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
