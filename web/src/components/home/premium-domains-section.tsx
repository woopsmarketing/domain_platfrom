"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ArrowRight, Crown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";
import type { MarketplaceListingHome } from "@/lib/db/analytics";

type SortMode = "price_desc" | "price_asc" | "latest";

const SORT_LABELS: Record<SortMode, string> = {
  price_desc: "높은 가격순",
  price_asc: "낮은 가격순",
  latest: "최신순",
};

interface PremiumDomainsSectionProps {
  listings: MarketplaceListingHome[];
}

export function PremiumDomainsSection({ listings }: PremiumDomainsSectionProps) {
  const [sort, setSort] = useState<SortMode>("price_desc");

  const sorted = useMemo(() => {
    const arr = [...listings];
    switch (sort) {
      case "price_desc":
        arr.sort((a, b) => b.asking_price - a.asking_price);
        break;
      case "price_asc":
        arr.sort((a, b) => a.asking_price - b.asking_price);
        break;
      case "latest":
        arr.sort((a, b) => new Date(b.listed_at).getTime() - new Date(a.listed_at).getTime());
        break;
    }
    return arr.slice(0, 12);
  }, [listings, sort]);

  if (listings.length === 0) {
    return (
      <section className="border-b px-4 py-16">
        <div className="mx-auto max-w-5xl">
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
              <Crown className="h-4 w-4 text-primary" />
            </div>
            <h2 className="text-xl font-semibold">인기 프리미엄 도메인</h2>
          </div>
          <Card className="border-border/60 border-dashed">
            <CardContent className="py-12 text-center text-sm text-muted-foreground">
              등록된 프리미엄 도메인이 없습니다.
            </CardContent>
          </Card>
        </div>
      </section>
    );
  }

  return (
    <section className="border-b px-4 py-16">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
              <Crown className="h-4 w-4 text-primary" />
            </div>
            <h2 className="text-xl font-semibold">인기 프리미엄 도메인</h2>
          </div>
          <Link
            href="/marketplace"
            className="flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-primary"
          >
            마켓플레이스 전체보기 <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Filter tabs */}
        <div className="mb-6 flex gap-2">
          {(Object.keys(SORT_LABELS) as SortMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => setSort(mode)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                sort === mode
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {SORT_LABELS[mode]}
            </button>
          ))}
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {sorted.map((item) => (
            <Link key={item.domain_name} href={`/marketplace/${item.domain_name}`}>
              <Card className="group border-border/60 transition-all hover:border-primary/30 hover:shadow-md hover:shadow-primary/5">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <span className="truncate text-sm font-medium group-hover:text-primary transition-colors">
                      {item.domain_name}
                    </span>
                    <span className="ml-2 shrink-0 text-base font-bold text-primary">
                      {formatPrice(item.asking_price)}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center gap-1.5">
                    {item.moz_da != null && (
                      <Badge variant="secondary" className="rounded-md text-xs font-normal">
                        DA {item.moz_da}
                      </Badge>
                    )}
                    {item.ahrefs_dr != null && (
                      <Badge variant="secondary" className="rounded-md text-xs font-normal">
                        DR {item.ahrefs_dr}
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
