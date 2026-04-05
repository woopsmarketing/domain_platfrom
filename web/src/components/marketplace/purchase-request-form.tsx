"use client";

import { useState } from "react";
import { Send, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export interface PurchaseRequestFormProps {
  listingId: string;
  domainName: string;
  askingPrice: number;
}

export function PurchaseRequestForm({
  listingId,
  domainName,
  askingPrice,
}: PurchaseRequestFormProps) {
  const [email, setEmail] = useState("");
  const [telegramId, setTelegramId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email) {
      setError("이메일 주소를 입력해주세요.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/purchase-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listing_id: listingId,
          email: email.trim(),
          telegram_id: telegramId.trim().replace(/^@/, "") || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        if (res.status === 409) {
          setError("이미 판매 완료된 도메인입니다.");
        } else {
          setError(data.error || "신청 처리 중 오류가 발생했습니다.");
        }
        return;
      }

      setSuccess(true);
    } catch {
      setError("네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <Card className="border-border/60">
        <CardContent className="py-10 text-center">
          <CheckCircle2 className="mx-auto h-10 w-10 text-green-500 mb-4" />
          <h3 className="text-lg font-bold mb-2">구매 신청이 접수되었습니다</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            가용 여부를 확인하여 이메일 또는 텔레그램으로
            <br />
            입금 안내를 드리겠습니다.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/60">
      <CardContent className="p-6">
        <div className="mb-5">
          <h2 className="text-lg font-bold">구매 신청</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{domainName}</span> ·{" "}
            <span className="font-semibold text-primary">
              ${askingPrice.toLocaleString()}
            </span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium">
              이메일 주소 <span className="text-red-500">*</span>
            </label>
            <Input
              type="email"
              placeholder="example@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">
              텔레그램 ID{" "}
              <span className="text-muted-foreground font-normal">(선택)</span>
            </label>
            <Input
              type="text"
              placeholder="@username"
              value={telegramId}
              onChange={(e) => setTelegramId(e.target.value)}
              autoComplete="off"
            />
          </div>

          {error && (
            <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950/40 dark:text-red-400">
              {error}
            </p>
          )}

          <Button
            type="submit"
            className="w-full gap-2"
            disabled={submitting}
          >
            <Send className="h-4 w-4" />
            {submitting ? "접수 중..." : "구매 신청하기"}
          </Button>
        </form>

        <p className="mt-4 text-xs text-muted-foreground leading-relaxed">
          신청 후 가용 여부를 확인하여 이메일 또는 텔레그램으로 입금 안내를
          드립니다.
        </p>
      </CardContent>
    </Card>
  );
}
