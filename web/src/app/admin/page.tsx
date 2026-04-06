"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { ShieldCheck, Plus, X } from "lucide-react";
import { PurchaseRequestsTab } from "@/components/admin/purchase-requests-tab";
import { BlogPostsTab } from "@/components/admin/blog-posts-tab";

const ADMIN_USER_ID = process.env.NEXT_PUBLIC_ADMIN_USER_ID;

interface Listing {
  id: string;
  domain_id: string;
  asking_price: number;
  description: string | null;
  is_negotiable: boolean;
  is_active: boolean;
  listed_at: string;
  domains: { name: string; tld: string } | null;
}

interface Inquiry {
  id: string;
  type: "broker" | "marketplace";
  name: string;
  email: string;
  telegram?: string | null;
  target_keyword?: string | null;
  budget?: string | null;
  message?: string | null;
  offered_price_usd?: number | null;
  status: string;
  created_at: string;
  marketplace_listings?: {
    domain_id: string;
    domains: { name: string } | null;
  } | null;
}

export default function AdminPage() {
  const { user, loading } = useAuth();
  const authorized = !loading && !!user && user.id === ADMIN_USER_ID;

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-muted-foreground">로딩 중...</p>
      </div>
    );
  }

  if (!authorized) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-muted-foreground">접근 권한이 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
          <ShieldCheck className="h-5 w-5 text-primary" />
        </div>
        <h1 className="text-2xl font-bold">관리자 대시보드</h1>
      </div>

      <Tabs defaultValue="listings">
        <TabsList className="mb-6">
          <TabsTrigger value="listings">도메인 판매 관리</TabsTrigger>
          <TabsTrigger value="purchase-requests">구매 신청</TabsTrigger>
          <TabsTrigger value="inquiries">문의 관리</TabsTrigger>
          <TabsTrigger value="blog">블로그 관리</TabsTrigger>
        </TabsList>

        <TabsContent value="listings">
          <ListingsTab />
        </TabsContent>
        <TabsContent value="purchase-requests">
          <PurchaseRequestsTab />
        </TabsContent>
        <TabsContent value="inquiries">
          <InquiriesTab />
        </TabsContent>
        <TabsContent value="blog">
          <BlogPostsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

/* ─────────── Listings Tab ─────────── */
function ListingsTab() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newListing, setNewListing] = useState({
    domain_name: "",
    asking_price: "",
    description: "",
    is_negotiable: false,
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchListings = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/listings");
      const data = await res.json();
      setListings(data.listings ?? []);
    } catch {
      /* ignore */
    } finally {
      setLoadingData(false);
    }
  }, []);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  const toggleActive = async (id: string, currentActive: boolean) => {
    await fetch("/api/admin/listings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, is_active: !currentActive }),
    });
    fetchListings();
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await fetch("/api/admin/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newListing),
      });
      setShowForm(false);
      setNewListing({
        domain_name: "",
        asking_price: "",
        description: "",
        is_negotiable: false,
      });
      fetchListings();
    } catch {
      /* ignore */
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingData) {
    return <p className="text-muted-foreground py-8 text-center">로딩 중...</p>;
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          총 {listings.length}개 등록
        </p>
        <Button size="sm" onClick={() => setShowForm(!showForm)}>
          {showForm ? (
            <>
              <X className="h-4 w-4" /> 닫기
            </>
          ) : (
            <>
              <Plus className="h-4 w-4" /> 새 도메인 등록
            </>
          )}
        </Button>
      </div>

      {showForm && (
        <Card className="mb-6 border-border/60">
          <CardContent className="p-6">
            <form onSubmit={handleAdd} className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  도메인 이름
                </label>
                <Input
                  placeholder="example.com"
                  value={newListing.domain_name}
                  onChange={(e) =>
                    setNewListing({ ...newListing, domain_name: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  판매 가격 (USD)
                </label>
                <Input
                  type="number"
                  placeholder="500"
                  value={newListing.asking_price}
                  onChange={(e) =>
                    setNewListing({
                      ...newListing,
                      asking_price: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-sm font-medium">
                  설명 (선택)
                </label>
                <Input
                  placeholder="이 도메인의 특징을 간단히 설명해주세요"
                  value={newListing.description}
                  onChange={(e) =>
                    setNewListing({
                      ...newListing,
                      description: e.target.value,
                    })
                  }
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="negotiable"
                  checked={newListing.is_negotiable}
                  onChange={(e) =>
                    setNewListing({
                      ...newListing,
                      is_negotiable: e.target.checked,
                    })
                  }
                />
                <label htmlFor="negotiable" className="text-sm">
                  협의 가능
                </label>
              </div>
              <div className="flex justify-end">
                <Button type="submit" disabled={submitting}>
                  {submitting ? "등록 중..." : "등록"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card className="border-border/60">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>도메인</TableHead>
              <TableHead>가격</TableHead>
              <TableHead>협의</TableHead>
              <TableHead>상태</TableHead>
              <TableHead>등록일</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {listings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  등록된 판매 도메인이 없습니다
                </TableCell>
              </TableRow>
            ) : (
              listings.map((l) => (
                <TableRow key={l.id}>
                  <TableCell className="font-medium">
                    {l.domains?.name ?? "-"}
                  </TableCell>
                  <TableCell>${l.asking_price.toLocaleString()}</TableCell>
                  <TableCell>
                    {l.is_negotiable ? (
                      <Badge variant="secondary" className="text-xs">
                        가능
                      </Badge>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={l.is_active ? "active" : "outline"} className="text-xs">
                      {l.is_active ? "활성" : "비활성"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(l.listed_at).toLocaleDateString("ko-KR")}
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => toggleActive(l.id, l.is_active)}
                    >
                      {l.is_active ? "비활성화" : "활성화"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

/* ─────────── Inquiries Tab ─────────── */
function InquiriesTab() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const fetchInquiries = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/inquiries");
      const data = await res.json();
      setInquiries(data.inquiries ?? []);
    } catch {
      /* ignore */
    } finally {
      setLoadingData(false);
    }
  }, []);

  useEffect(() => {
    fetchInquiries();
  }, [fetchInquiries]);

  const updateStatus = async (
    id: string,
    type: string,
    newStatus: string
  ) => {
    await fetch("/api/admin/inquiries", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, type, status: newStatus }),
    });
    fetchInquiries();
  };

  const nextStatus = (current: string) => {
    if (current === "pending") return "replied";
    if (current === "replied") return "closed";
    return "pending";
  };

  const statusColor = (s: string) => {
    if (s === "pending") return "destructive" as const;
    if (s === "replied") return "secondary" as const;
    return "outline" as const;
  };

  const statusLabel = (s: string) => {
    if (s === "pending") return "대기";
    if (s === "replied") return "답변 완료";
    return "종료";
  };

  if (loadingData) {
    return <p className="text-muted-foreground py-8 text-center">로딩 중...</p>;
  }

  return (
    <div>
      <p className="mb-4 text-sm text-muted-foreground">
        총 {inquiries.length}건
      </p>

      <div className="space-y-3">
        {inquiries.length === 0 ? (
          <Card className="border-border/60 border-dashed">
            <CardContent className="py-12 text-center text-muted-foreground">
              문의 내역이 없습니다
            </CardContent>
          </Card>
        ) : (
          inquiries.map((inq) => (
            <Card key={`${inq.type}-${inq.id}`} className="border-border/60">
              <CardContent className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <Badge
                        variant={inq.type === "broker" ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {inq.type === "broker" ? "경매 대행" : "구매 문의"}
                      </Badge>
                      <Badge
                        variant={statusColor(inq.status)}
                        className="text-xs"
                      >
                        {statusLabel(inq.status)}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(inq.created_at).toLocaleString("ko-KR")}
                      </span>
                    </div>

                    <div className="grid gap-1 text-sm">
                      <p>
                        <span className="text-muted-foreground">이름:</span>{" "}
                        {inq.name}
                      </p>
                      <p>
                        <span className="text-muted-foreground">이메일:</span>{" "}
                        {inq.email}
                      </p>
                      {inq.telegram && (
                        <p>
                          <span className="text-muted-foreground">
                            텔레그램:
                          </span>{" "}
                          {inq.telegram}
                        </p>
                      )}
                      {inq.target_keyword && (
                        <p>
                          <span className="text-muted-foreground">
                            키워드:
                          </span>{" "}
                          {inq.target_keyword}
                        </p>
                      )}
                      {inq.budget && (
                        <p>
                          <span className="text-muted-foreground">예산:</span>{" "}
                          {inq.budget}
                        </p>
                      )}
                      {inq.offered_price_usd && (
                        <p>
                          <span className="text-muted-foreground">
                            제안가:
                          </span>{" "}
                          ${inq.offered_price_usd}
                        </p>
                      )}
                      {inq.marketplace_listings?.domains?.name && (
                        <p>
                          <span className="text-muted-foreground">
                            도메인:
                          </span>{" "}
                          {inq.marketplace_listings.domains.name}
                        </p>
                      )}
                      {inq.message && (
                        <p className="text-muted-foreground mt-1">
                          {inq.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      updateStatus(inq.id, inq.type, nextStatus(inq.status))
                    }
                  >
                    {inq.status === "pending"
                      ? "답변 완료"
                      : inq.status === "replied"
                        ? "종료"
                        : "재오픈"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
