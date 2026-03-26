"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

type HistoryItem = {
  id: number;
  domain_name: string;
  searched_at: string;
};

export default function HistoryPage() {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(true);
  const limit = 20;

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) });
      if (search) params.set("search", search);
      const res = await fetch(`/api/dashboard/history?${params}`);
      if (res.ok) {
        const data = await res.json();
        if (page === 1) {
          setItems(data.items ?? []);
        } else {
          setItems((prev) => [...prev, ...(data.items ?? [])]);
        }
        setTotal(data.total ?? 0);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setItems([]);
    setSearch(searchInput.trim());
  };

  const hasMore = items.length < total;

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-bold">분석 이력</h1>

      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="도메인명으로 검색..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button type="submit" variant="outline" size="sm">
          검색
        </Button>
      </form>

      <Card>
        <CardContent className="p-0">
          {loading && items.length === 0 ? (
            <div className="flex flex-col gap-2 p-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-10 animate-pulse rounded bg-muted" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-sm text-muted-foreground">아직 분석 기록이 없습니다.</p>
              <Link href="/">
                <Button variant="outline" size="sm" className="mt-3">
                  도메인 분석 시작하기 →
                </Button>
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-border/60">
              {items.map((item) => (
                <Link
                  key={`${item.id}-${item.searched_at}`}
                  href={`/domain/${item.domain_name}`}
                  className="flex items-center justify-between px-4 py-3 text-sm transition-colors hover:bg-accent"
                >
                  <span className="font-medium">{item.domain_name}</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(item.searched_at).toLocaleDateString("ko-KR", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </Link>
              ))}
            </div>
          )}

          {hasMore && (
            <div className="border-t border-border/60 p-4 text-center">
              <Button
                variant="outline"
                size="sm"
                disabled={loading}
                onClick={() => setPage((p) => p + 1)}
              >
                {loading ? "불러오는 중..." : "더 보기"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
