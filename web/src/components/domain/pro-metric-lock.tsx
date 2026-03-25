"use client";

import { Lock } from "lucide-react";
import Link from "next/link";
import { isPro } from "@/lib/subscription";

/**
 * Pro 전용 지표를 감싸는 래퍼.
 * Free 사용자에게는 잠금 아이콘 + Pro 안내를 표시합니다.
 */
export function ProMetricValue({
  value,
  format,
}: {
  value: number | string | null | undefined;
  format?: (v: number) => string;
}) {
  if (isPro()) {
    if (value == null) return <span>-</span>;
    const display = typeof value === "number" && format ? format(value) : String(value);
    return <span>{display}</span>;
  }

  return (
    <Link
      href="/pricing"
      className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
      title="Pro 전용 지표"
    >
      <Lock className="h-3 w-3" />
      <span>Pro</span>
    </Link>
  );
}

/**
 * Pro 전용 지표인지 확인하고 값 또는 잠금을 반환하는 헬퍼.
 * MetricBlock의 items에서 사용.
 */
export function proValue(
  value: number | string | null | undefined,
  isProField: boolean
): number | string | null | undefined {
  if (!isProField) return value;
  if (typeof window !== "undefined" && isPro()) return value;
  return "__pro_locked__" as unknown as undefined;
}
