"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, Send, Headphones, Home, Crown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const BUDGET_OPTIONS = [
  "10만원 이하",
  "10~50만원",
  "50~100만원",
  "100만원 이상",
  "미정",
];

export default function BrokerInquiryPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    telegram: "",
    target_keyword: "",
    budget: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.name || !form.email || !form.target_keyword) {
      setError("이름, 이메일, 타겟 키워드는 필수입니다.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/broker-inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          telegram: form.telegram || null,
          target_keyword: form.target_keyword,
          budget: form.budget || null,
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
              24시간 내 상세 답변을 드리겠습니다.
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
      <Card className="border-border/60">
        <CardContent className="p-6 sm:p-8">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
              <Headphones className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-xl font-bold sm:text-2xl">
              경매 도메인 대행 서비스
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              원하는 도메인을 찾아드립니다. 경매 입찰부터 이전까지 전 과정을
              대행합니다.
            </p>
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
                텔레그램 ID (선택)
              </label>
              <Input
                placeholder="@username"
                value={form.telegram}
                onChange={(e) => setForm({ ...form, telegram: e.target.value })}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">
                어떤 분야의 도메인을 찾고 계신가요?{" "}
                <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="예: 부동산, 여행, AI, 건강식품..."
                value={form.target_keyword}
                onChange={(e) =>
                  setForm({ ...form, target_keyword: e.target.value })
                }
                required
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">예산</label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring sm:h-9 sm:text-sm"
                value={form.budget}
                onChange={(e) => setForm({ ...form, budget: e.target.value })}
              >
                <option value="">선택해주세요</option>
                {BUDGET_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">
                상세 요청사항 (선택)
              </label>
              <textarea
                className="flex min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring sm:text-sm"
                placeholder="원하는 도메인 특성, TLD 선호, 최소 DA 점수 등을 자유롭게 알려주세요"
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
              />
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

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
