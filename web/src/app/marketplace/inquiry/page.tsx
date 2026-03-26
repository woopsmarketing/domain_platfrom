"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Send, Home, Crown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

function InquiryForm() {
  const searchParams = useSearchParams();
  const domain = searchParams.get("domain") ?? "";
  const listingId = searchParams.get("listing") ?? "";

  const [form, setForm] = useState({
    name: "",
    email: "",
    offered_price_usd: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.name || !form.email) {
      setError("이름과 이메일은 필수입니다.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/marketplace-inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listing_id: listingId,
          name: form.name,
          email: form.email,
          offered_price_usd: form.offered_price_usd || null,
          message: form.message || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "문의 접수에 실패했습니다");
      }

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "문의 접수에 실패했습니다");
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <Card className="w-full max-w-lg border-border/60">
          <CardContent className="py-12 text-center">
            <CheckCircle2 className="mx-auto h-12 w-12 text-green-500 mb-4" />
            <h2 className="text-xl font-bold mb-2">문의가 접수되었습니다</h2>
            <p className="text-muted-foreground">
              입력하신 이메일로 확인 메일을 보내드렸습니다.
              <br />
              빠른 시일 내 상세 답변을 드리겠습니다.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link href="/">
                <Button variant="outline" className="w-full sm:w-auto gap-2">
                  <Home className="h-4 w-4" />
                  홈으로 가기
                </Button>
              </Link>
              <Link href="/marketplace">
                <Button className="w-full sm:w-auto gap-2">
                  <Crown className="h-4 w-4" />
                  프리미엄 도메인 보기
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-12 sm:py-16">
      <Link
        href="/marketplace"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        도메인 판매 목록으로
      </Link>

      <Card className="border-border/60">
        <CardContent className="p-6 sm:p-8">
          <div className="mb-6">
            <h1 className="text-xl font-bold sm:text-2xl">도메인 구매 문의</h1>
            {domain && (
              <p className="mt-2 text-muted-foreground">
                <span className="font-medium text-foreground">{domain}</span>에
                대한 구매 문의
              </p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium">
                이름 <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="홍길동"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">
                이메일 <span className="text-red-500">*</span>
              </label>
              <Input
                type="email"
                placeholder="example@email.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">
                제안 가격 (USD, 선택)
              </label>
              <Input
                type="number"
                placeholder="예: 500"
                value={form.offered_price_usd}
                onChange={(e) =>
                  setForm({ ...form, offered_price_usd: e.target.value })
                }
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">
                메시지
              </label>
              <textarea
                className="flex min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring sm:text-sm"
                placeholder="추가 문의사항을 입력해주세요"
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
              />
            </div>

            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}

            <Button type="submit" className="w-full" disabled={submitting}>
              <Send className="h-4 w-4" />
              {submitting ? "접수 중..." : "문의 보내기"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function MarketplaceInquiryPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center">
          <p className="text-muted-foreground">로딩 중...</p>
        </div>
      }
    >
      <InquiryForm />
    </Suspense>
  );
}
