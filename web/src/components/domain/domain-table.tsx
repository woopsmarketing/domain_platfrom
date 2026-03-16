"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatPrice, formatNumber } from "@/lib/utils";
import type { DomainListItem } from "@/types/domain";

const sourceLabel: Record<string, string> = {
  godaddy: "GoDaddy",
  namecheap: "Namecheap",
  dynadot: "Dynadot",
  other: "기타",
};

const statusVariant: Record<string, "default" | "secondary" | "outline"> = {
  sold: "default",
  expired: "secondary",
  active: "outline",
};

const statusLabel: Record<string, string> = {
  sold: "낙찰",
  expired: "만료",
  active: "활성",
};

interface DomainTableProps {
  domains: DomainListItem[];
}

export function DomainTable({ domains }: DomainTableProps) {
  if (domains.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20 text-muted-foreground">
        <p className="text-lg font-medium">아직 표시할 도메인이 없습니다</p>
        <p className="text-sm">상단 검색창에서 도메인을 검색하면 여기에 표시됩니다.</p>
        <Link
          href="/"
          className="mt-2 inline-flex h-10 items-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          도메인 검색하기
        </Link>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[250px]">도메인</TableHead>
          <TableHead>상태</TableHead>
          <TableHead>출처</TableHead>
          <TableHead className="text-right">DA</TableHead>
          <TableHead className="text-right">DR</TableHead>
          <TableHead className="text-right">TF</TableHead>
          <TableHead className="text-right">트래픽</TableHead>
          <TableHead className="text-right">낙찰가</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {domains.map((domain) => (
          <TableRow key={domain.id}>
            <TableCell className="font-medium">
              <Link
                href={`/domain/${domain.name}`}
                className="text-base text-primary hover:underline"
              >
                {domain.name}
              </Link>
            </TableCell>
            <TableCell>
              <Badge variant={statusVariant[domain.status] ?? "outline"}>
                {statusLabel[domain.status] ?? domain.status}
              </Badge>
            </TableCell>
            <TableCell className="text-muted-foreground text-xs">
              {sourceLabel[domain.source] ?? domain.source}
            </TableCell>
            <TableCell className="text-right tabular-nums">
              {domain.metrics?.mozDA ?? "—"}
            </TableCell>
            <TableCell className="text-right tabular-nums">
              {domain.metrics?.ahrefsDR ?? "—"}
            </TableCell>
            <TableCell className="text-right tabular-nums">
              {domain.metrics?.majesticTF ?? "—"}
            </TableCell>
            <TableCell className="text-right tabular-nums text-muted-foreground">
              {domain.metrics?.ahrefsTraffic
                ? formatNumber(domain.metrics.ahrefsTraffic)
                : "—"}
            </TableCell>
            <TableCell className="text-right font-medium tabular-nums">
              {domain.soldPrice ? formatPrice(domain.soldPrice) : "—"}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
