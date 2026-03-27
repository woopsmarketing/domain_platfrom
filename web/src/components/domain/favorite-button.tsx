"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
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
    if (loading || busy) return;
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
    <button
      onClick={handleToggle}
      disabled={busy}
      className="inline-flex items-center justify-center rounded-md p-2 transition-colors hover:bg-accent disabled:opacity-50"
      aria-label={isFavorite ? "즐겨찾기 해제" : "즐겨찾기 추가"}
      title={isFavorite ? "즐겨찾기 해제" : "즐겨찾기 추가"}
    >
      <Heart
        className={`h-5 w-5 transition-colors ${
          isFavorite
            ? "fill-red-500 text-red-500"
            : "text-muted-foreground hover:text-red-400"
        }`}
      />
    </button>
  );
}
