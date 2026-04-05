"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  PURCHASE_STATUS_LABELS,
  PURCHASE_STATUS_COLORS,
  type PurchaseRequestStatus,
} from "@/types/marketplace";

interface PurchaseRequestRow {
  id: string;
  listing_id: string;
  email: string;
  telegram_id: string | null;
  status: PurchaseRequestStatus;
  admin_memo: string | null;
  created_at: string;
  updated_at: string;
  marketplace_listings: {
    asking_price: number;
    domains: { name: string; tld: string } | null;
  } | null;
}

const ALL_STATUSES: PurchaseRequestStatus[] = [
  "pending",
  "availability_checking",
  "waiting_payment",
  "payment_received",
  "transferring",
  "completed",
  "failed",
];

export function PurchaseRequestsTab() {
  const [requests, setRequests] = useState<PurchaseRequestRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchRequests = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/purchase-requests");
      const data = await res.json();
      setRequests(data.requests ?? []);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const updateStatus = async (id: string, newStatus: PurchaseRequestStatus, memo?: string) => {
    setUpdatingId(id);
    try {
      await fetch("/api/admin/purchase-requests", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus, admin_memo: memo }),
      });
      fetchRequests();
    } catch {
      /* ignore */
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return <p className="text-muted-foreground py-8 text-center">로딩 중...</p>;
  }

  return (
    <div>
      <p className="mb-4 text-sm text-muted-foreground">
        총 {requests.length}건
      </p>

      {requests.length === 0 ? (
        <Card className="border-border/60 border-dashed">
          <CardContent className="py-12 text-center text-muted-foreground">
            구매 신청 내역이 없습니다
          </CardContent>
        </Card>
      ) : (
        <Card className="border-border/60">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>도메인</TableHead>
                  <TableHead>가격</TableHead>
                  <TableHead>이메일</TableHead>
                  <TableHead>텔레그램</TableHead>
                  <TableHead>상태</TableHead>
                  <TableHead>신청일</TableHead>
                  <TableHead>상태 변경</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((req) => (
                  <TableRow key={req.id}>
                    <TableCell className="font-medium">
                      {req.marketplace_listings?.domains?.name ?? "-"}
                    </TableCell>
                    <TableCell>
                      ${req.marketplace_listings?.asking_price?.toLocaleString() ?? "-"}
                    </TableCell>
                    <TableCell className="text-sm">
                      <a
                        href={`mailto:${req.email}`}
                        className="text-primary hover:underline"
                      >
                        {req.email}
                      </a>
                    </TableCell>
                    <TableCell className="text-sm">
                      {req.telegram_id ? `@${req.telegram_id}` : "-"}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${
                          PURCHASE_STATUS_COLORS[req.status] ?? ""
                        }`}
                      >
                        {PURCHASE_STATUS_LABELS[req.status] ?? req.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                      {new Date(req.created_at).toLocaleDateString("ko-KR")}
                    </TableCell>
                    <TableCell>
                      <select
                        className="rounded-md border border-border bg-background px-2 py-1 text-xs"
                        value={req.status}
                        disabled={updatingId === req.id}
                        onChange={(e) =>
                          updateStatus(req.id, e.target.value as PurchaseRequestStatus)
                        }
                      >
                        {ALL_STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {PURCHASE_STATUS_LABELS[s]}
                          </option>
                        ))}
                      </select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}
    </div>
  );
}
