"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { cn } from "@/lib/utils";

interface FilterOption {
  label: string;
  value: string;
}

const PRICE_OPTIONS: FilterOption[] = [
  { label: "전체", value: "" },
  { label: "~$500", value: "0-500" },
  { label: "$500~$2,000", value: "500-2000" },
  { label: "$2,000~$5,000", value: "2000-5000" },
  { label: "$5,000+", value: "5000-" },
];

const TLD_OPTIONS: FilterOption[] = [
  { label: "전체", value: "" },
  { label: ".com", value: "com" },
  { label: ".net", value: "net" },
  { label: ".org", value: "org" },
  { label: "기타", value: "other" },
];

const SORT_OPTIONS: FilterOption[] = [
  { label: "최신순", value: "latest" },
  { label: "가격 낮은순", value: "price_asc" },
  { label: "가격 높은순", value: "price_desc" },
  { label: "도메인 나이순", value: "age_desc" },
];

function FilterButton({
  label,
  isActive,
  onClick,
}: {
  label: string;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex h-8 cursor-pointer items-center rounded-full border px-3 text-xs font-medium transition-colors",
        isActive
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border/60 bg-background text-muted-foreground hover:border-primary/40 hover:bg-accent hover:text-accent-foreground"
      )}
    >
      {label}
    </button>
  );
}

interface ListingFiltersProps {
  currentTld: string;
  currentPrice: string;
  currentSort: string;
  totalCount: number;
}

export default function ListingFilters({
  currentTld,
  currentPrice,
  currentSort,
  totalCount,
}: ListingFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      // 필터 변경 시 항상 첫 페이지로
      params.delete("page");
      router.push(`/marketplace?${params.toString()}`, { scroll: false });
    },
    [router, searchParams]
  );

  const handlePrice = (value: string) => {
    if (value === "") {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("min_price");
      params.delete("max_price");
      params.delete("page");
      router.push(`/marketplace?${params.toString()}`, { scroll: false });
      return;
    }
    const [min, max] = value.split("-");
    const params = new URLSearchParams(searchParams.toString());
    if (min) params.set("min_price", min);
    else params.delete("min_price");
    if (max) params.set("max_price", max);
    else params.delete("max_price");
    params.delete("page");
    router.push(`/marketplace?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="mb-8 space-y-4 rounded-xl border border-border/60 bg-card p-4 sm:p-5">
      {/* 결과 수 */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">{totalCount}</span>개 도메인
        </p>
      </div>

      {/* 가격대 */}
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          가격대
        </p>
        <div className="flex flex-wrap gap-2">
          {PRICE_OPTIONS.map((opt) => {
            const isActive = (() => {
              if (opt.value === "") return !currentPrice;
              const [min, max] = opt.value.split("-");
              const paramMin = searchParams.get("min_price") ?? "";
              const paramMax = searchParams.get("max_price") ?? "";
              return paramMin === (min ?? "") && paramMax === (max ?? "");
            })();
            return (
              <FilterButton
                key={opt.value}
                label={opt.label}
                isActive={isActive}
                onClick={() => handlePrice(opt.value)}
              />
            );
          })}
        </div>
      </div>

      {/* TLD */}
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          TLD
        </p>
        <div className="flex flex-wrap gap-2">
          {TLD_OPTIONS.map((opt) => (
            <FilterButton
              key={opt.value}
              label={opt.label}
              isActive={currentTld === opt.value}
              onClick={() => updateParam("tld", opt.value)}
            />
          ))}
        </div>
      </div>

      {/* 정렬 */}
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          정렬
        </p>
        <div className="flex flex-wrap gap-2">
          {SORT_OPTIONS.map((opt) => (
            <FilterButton
              key={opt.value}
              label={opt.label}
              isActive={currentSort === opt.value || (!currentSort && opt.value === "latest")}
              onClick={() => updateParam("sort", opt.value === "latest" ? "" : opt.value)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
