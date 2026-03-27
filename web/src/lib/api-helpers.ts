import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";

/**
 * 인증 확인 헬퍼 — Dashboard API 공통
 * @returns user 객체 또는 401 NextResponse
 */
export async function requireAuth() {
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return {
      user: null,
      error: NextResponse.json(
        { error: "인증이 필요합니다" },
        { status: 401 }
      ),
    };
  }

  return { user, error: null };
}

/**
 * 어드민 확인 헬퍼 — Admin API 공통
 * @returns user 객체 또는 401/403 NextResponse
 */
export async function requireAdmin() {
  const result = await requireAuth();
  if (result.error) return result;

  const adminId = process.env.NEXT_PUBLIC_ADMIN_USER_ID;
  if (result.user!.id !== adminId) {
    return {
      user: null,
      error: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }

  return result;
}

/**
 * 서비스 클라이언트 (편의용 re-export)
 */
export function getServiceClient() {
  return createServiceClient();
}
