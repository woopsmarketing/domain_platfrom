"use client";

import { useState } from "react";
import Link from "next/link";
import { Heart, Pencil, Trash2, Check, X } from "lucide-react";
import { useFetch } from "@/hooks/use-fetch";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type FavoriteItem = {
  id: string;
  domain_name: string;
  memo: string | null;
  created_at: string;
};

type FavoritesResponse = {
  items: FavoriteItem[];
};

export default function FavoritesPage() {
  const { data, loading, refresh } = useFetch<FavoritesResponse>("/api/dashboard/favorites", { cacheTime: 0 });
  const items = data?.items ?? [];
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editMemo, setEditMemo] = useState("");

  const handleDelete = async (id: string) => {
    if (!window.confirm("이 도메인을 즐겨찾기에서 삭제하시겠습니까?")) return;

    try {
      const res = await fetch("/api/dashboard/favorites", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        refresh();
      }
    } catch {
      // ignore
    }
  };

  const handleEditStart = (item: FavoriteItem) => {
    setEditingId(item.id);
    setEditMemo(item.memo ?? "");
  };

  const handleEditSave = async (id: string) => {
    try {
      const res = await fetch("/api/dashboard/favorites", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, memo: editMemo }),
      });
      if (res.ok) {
        refresh();
      }
    } catch {
      // ignore
    } finally {
      setEditingId(null);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-bold">즐겨찾기</h1>

      {loading ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Heart className="mx-auto mb-3 h-8 w-8 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">즐겨찾기한 도메인이 없습니다.</p>
            <p className="mt-1 text-xs text-muted-foreground">도메인 상세 페이지에서 하트 버튼을 눌러 추가하세요.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {items.map((item) => (
            <Card key={item.id}>
              <CardContent className="flex flex-col gap-2 p-4">
                <div className="flex items-start justify-between">
                  <Link
                    href={`/domain/${item.domain_name}`}
                    className="text-sm font-semibold text-primary hover:underline"
                  >
                    {item.domain_name}
                  </Link>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleEditStart(item)}
                      className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                      aria-label="메모 편집"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                      aria-label="즐겨찾기에서 삭제"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {editingId === item.id ? (
                  <div className="flex gap-1">
                    <Input
                      value={editMemo}
                      onChange={(e) => setEditMemo(e.target.value)}
                      placeholder="메모 입력..."
                      className="h-8 text-xs"
                      autoFocus
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0"
                      onClick={() => handleEditSave(item.id)}
                      aria-label="메모 저장"
                    >
                      <Check className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0"
                      onClick={() => setEditingId(null)}
                      aria-label="메모 편집 취소"
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    {item.memo || "메모 없음"}
                  </p>
                )}

                <p className="text-xs text-muted-foreground/60">
                  {new Date(item.created_at).toLocaleDateString("ko-KR")}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
