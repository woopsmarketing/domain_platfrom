"use client";

import { useRouter } from "next/navigation";
import { Bell, CheckCheck } from "lucide-react";
import { useFetch } from "@/hooks/use-fetch";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type NotificationItem = {
  id: number;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  link: string | null;
  created_at: string;
};

type NotificationsResponse = {
  items: NotificationItem[];
};

export default function NotificationsPage() {
  const router = useRouter();
  const { data, loading, refresh } = useFetch<NotificationsResponse>("/api/dashboard/notifications", { cacheTime: 30000 });
  const items = data?.items ?? [];

  const handleMarkAllRead = async () => {
    try {
      const res = await fetch("/api/dashboard/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAllRead: true }),
      });
      if (res.ok) {
        refresh();
      }
    } catch {
      // ignore
    }
  };

  const handleClick = async (item: NotificationItem) => {
    if (!item.is_read) {
      try {
        await fetch("/api/dashboard/notifications", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: item.id }),
        });
        refresh();
      } catch {
        // ignore
      }
    }
    // link 검증: 내부 경로만 허용
    if (item.link && item.link.startsWith("/")) {
      router.push(item.link);
    }
  };

  const unreadCount = items.filter((n) => !n.is_read).length;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">알림</h1>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" className="gap-1.5" onClick={handleMarkAllRead}>
            <CheckCheck className="h-3.5 w-3.5" />
            전체 읽음
          </Button>
        )}
      </div>

      {loading ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Bell className="mx-auto mb-3 h-8 w-8 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">알림이 없습니다.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-2">
          {items.map((item) => (
            <Card
              key={item.id}
              className={`cursor-pointer transition-colors hover:bg-accent/50 ${
                !item.is_read ? "border-primary/20 bg-primary/5" : ""
              }`}
              onClick={() => handleClick(item)}
            >
              <CardContent className="flex items-start gap-3 p-4">
                <div
                  className={`mt-1 h-2 w-2 shrink-0 rounded-full ${
                    item.is_read ? "bg-transparent" : "bg-primary"
                  }`}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{item.title}</p>
                  <p className="text-xs text-muted-foreground line-clamp-2">{item.message}</p>
                  <p className="mt-1 text-xs text-muted-foreground/60">
                    {new Date(item.created_at).toLocaleDateString("ko-KR", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
