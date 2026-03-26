"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/providers/auth-provider";

interface FavoriteButtonProps {
  domainName: string;
}

export function FavoriteButton({ domainName }: FavoriteButtonProps) {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteId, setFavoriteId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!user) return;
    const checkFavorite = async () => {
      try {
        // 단건 체크: 전체 목록 대신 해당 도메인만 조회
        const res = await fetch(`/api/dashboard/favorites?check=${encodeURIComponent(domainName)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.isFavorite) {
            setIsFavorite(true);
            setFavoriteId(data.id ?? null);
          }
        }
      } catch {
        // ignore
      }
    };
    checkFavorite();
  }, [user, domainName]);

  const handleToggle = async () => {
    if (loading) return;
    if (!user) {
      router.push(`/login?redirect=/domain/${domainName}`);
      return;
    }

    setBusy(true);
    try {
      if (isFavorite && favoriteId) {
        const res = await fetch("/api/dashboard/favorites", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: favoriteId }),
        });
        if (res.ok) {
          setIsFavorite(false);
          setFavoriteId(null);
        }
      } else {
        const res = await fetch("/api/dashboard/favorites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ domain_name: domainName }),
        });
        if (res.ok) {
          const data = await res.json();
          setIsFavorite(true);
          setFavoriteId(data.item?.id ?? null);
        }
      }
    } catch {
      // ignore
    } finally {
      setBusy(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleToggle}
      disabled={busy}
      className="gap-1.5"
      aria-label={isFavorite ? "즐겨찾기 해제" : "즐겨찾기 추가"}
    >
      <Heart
        className={`h-3.5 w-3.5 ${isFavorite ? "fill-pink-500 text-pink-500" : ""}`}
      />
      {isFavorite ? "즐겨찾기됨" : "즐겨찾기"}
    </Button>
  );
}
