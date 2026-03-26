"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/providers/auth-provider";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ChangePasswordPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const isGoogleUser = user?.app_metadata?.provider === "google";

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login?redirect=/account/change-password");
    }
  }, [loading, user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (newPassword.length < 6) {
      setError("비밀번호는 최소 6자 이상이어야 합니다.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }

    setSubmitting(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) {
        setError(error.message);
      } else {
        setSuccess(true);
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch {
      setError("비밀번호 변경에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 py-8 sm:px-6">
      <Link
        href="/account"
        className="mb-4 inline-block text-sm text-muted-foreground hover:text-primary"
      >
        &larr; 내 계정으로 돌아가기
      </Link>

      <div className="rounded-xl border border-border/60 bg-card p-6">
        <h1 className="mb-6 text-xl font-semibold">비밀번호 변경</h1>

        {isGoogleUser ? (
          <p className="text-sm text-muted-foreground">
            소셜 로그인 계정은 비밀번호를 변경할 수 없습니다.
          </p>
        ) : success ? (
          <div className="rounded-lg bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-400">
            비밀번호가 변경되었습니다.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {error && (
              <div className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            )}
            <div>
              <label htmlFor="new-password" className="mb-1.5 block text-sm font-medium">
                새 비밀번호
              </label>
              <Input
                id="new-password"
                type="password"
                placeholder="새 비밀번호 입력"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            <div>
              <label htmlFor="confirm-password" className="mb-1.5 block text-sm font-medium">
                비밀번호 확인
              </label>
              <Input
                id="confirm-password"
                type="password"
                placeholder="비밀번호 다시 입력"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            <Button type="submit" disabled={submitting} className="w-full">
              {submitting ? "변경 중..." : "비밀번호 변경"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
