"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  namecheap: "NameCheap",
  dynadot: "Dynadot",
  other: "기타",
};

const statusVariant: Record<string, "auction" | "expired" | "active"> = {
  auction: "auction",
  expired: "expired",
  active: "active",
};

const statusLabel: Record<string, string> = {
  auction: "경매",
  expired: "만료",
  active: "활성",
  sold: "판매완료",
};

interface DomainTableProps {
  domains: DomainListItem[];
}

export function DomainTable({ domains }: DomainTableProps) {
  if (domains.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
        <p className="text-lg">표시할 도메인이 없습니다</p>
        <p className="text-sm">필터를 변경하거나 나중에 다시 확인해주세요.</p>
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
          <TableHead className="text-right">가격</TableHead>
          <TableHead className="w-[50px]"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {domains.map((domain) => (
          <TableRow key={domain.id}>
            <TableCell className="font-medium">
              <Link
                href={`/domain/${domain.name}`}
                className="text-primary hover:underline"
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
              {domain.currentPrice ? formatPrice(domain.currentPrice) : "—"}
            </TableCell>
            <TableCell>
              <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="관심 등록">
                <Heart className="h-4 w-4" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
