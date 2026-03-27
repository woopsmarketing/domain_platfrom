"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/providers/auth-provider";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatDateKR } from "@/lib/utils";

function getProviderLabel(provider: string | undefined) {
  if (provider === "google") return "Google";
  if (provider === "email") return "이메일";
  return provider ?? "이메일";
}

export default function SettingsPage() {
  const router = useRouter();
  const { user } = useAuth();

  const handleSignOut = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push("/");
      router.refresh();
    } catch {
      alert("로그아웃에 실패했습니다. 다시 시도해주세요.");
    }
  };

  if (!user) return null;

  const isGoogleUser = user.app_metadata?.provider === "google";

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-bold">프로필 설정</h1>

      {/* 프로필 정보 */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
              {user.email?.charAt(0).toUpperCase() ?? "?"}
            </div>
            <div className="min-w-0">
              <p className="truncate text-lg font-semibold">{user.email}</p>
              <p className="text-sm text-muted-foreground">
                가입일: {user.created_at ? formatDateKR(user.created_at) : "-"}
              </p>
              <p className="text-sm text-muted-foreground">
                로그인 방법: {getProviderLabel(user.app_metadata?.provider)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 계정 관리 */}
      <Card>
        <CardContent className="p-6">
          <h2 className="mb-4 text-base font-semibold">계정 관리</h2>
          <div className="flex flex-wrap gap-3">
            {!isGoogleUser && (
              <Link href="/account/change-password">
                <Button variant="outline" size="sm">
                  비밀번호 변경
                </Button>
              </Link>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleSignOut}
              className="text-destructive"
            >
              로그아웃
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
