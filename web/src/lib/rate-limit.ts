import { createServiceClient } from "@/lib/supabase";
import { headers } from "next/headers";

interface RateLimitResult {
  allowed: boolean;
  used: number;
  limit: number;
  remaining: number;
}

export async function checkApiRateLimit(
  toolKey: string,
  dailyLimit: number
): Promise<RateLimitResult> {
  const headersList = await headers();
  const ip =
    headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headersList.get("x-real-ip") ||
    "unknown";

  const client = createServiceClient();
  const today = new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10);

  // 현재 사용량 조회
  const { data } = await client
    .from("api_usage")
    .select("count")
    .eq("ip", ip)
    .eq("tool_key", toolKey)
    .eq("used_date", today)
    .maybeSingle();

  const used = data?.count ?? 0;

  if (used >= dailyLimit) {
    return { allowed: false, used, limit: dailyLimit, remaining: 0 };
  }

  // 사용량 증가 (upsert)
  await client
    .from("api_usage")
    .upsert(
      { ip, tool_key: toolKey, used_date: today, count: used + 1 },
      { onConflict: "ip,tool_key,used_date" }
    );

  return {
    allowed: true,
    used: used + 1,
    limit: dailyLimit,
    remaining: dailyLimit - used - 1,
  };
}

// Pro 사용자 확인 (서버 사이드)
export async function isProUser(_request: Request): Promise<boolean> {
  try {
    // 동적 import로 순환 참조 방지
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return false;

    const client = createServiceClient();
    const { data: sub } = await client
      .from("subscriptions")
      .select("tier, expires_at")
      .eq("user_id", user.id)
      .maybeSingle();

    if (
      sub?.tier === "pro" &&
      (!sub.expires_at || new Date(sub.expires_at) > new Date())
    ) {
      return true;
    }
    return false;
  } catch {
    return false;
  }
}
