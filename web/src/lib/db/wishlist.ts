import { createClient } from "@supabase/supabase-js";

function createAuthClient(token: string) {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: { persistSession: false },
      global: {
        headers: { Authorization: `Bearer ${token}` },
      },
    }
  );
}

export interface WishlistItem {
  id: string;
  domainId: string;
  userId: string;
  createdAt: string;
}

export async function getWishlist(
  userId: string,
  token: string
): Promise<WishlistItem[]> {
  const client = createAuthClient(token);

  const { data, error } = await client
    .from("wishlists")
    .select("id, domain_id, user_id, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  return (data ?? []).map((row: Record<string, unknown>) => ({
    id: row.id as string,
    domainId: row.domain_id as string,
    userId: row.user_id as string,
    createdAt: row.created_at as string,
  }));
}

export async function toggleWishlist(
  userId: string,
  domainId: string,
  token: string
): Promise<{ action: "added" | "removed" }> {
  const client = createAuthClient(token);

  // 이미 존재하는지 확인
  const { data: existing, error: selectError } = await client
    .from("wishlists")
    .select("id")
    .eq("user_id", userId)
    .eq("domain_id", domainId)
    .single();

  if (selectError && selectError.code !== "PGRST116") {
    // PGRST116 = row not found
    throw new Error(selectError.message);
  }

  if (existing) {
    // 이미 있으면 삭제
    const { error: deleteError } = await client
      .from("wishlists")
      .delete()
      .eq("id", existing.id);

    if (deleteError) throw new Error(deleteError.message);
    return { action: "removed" };
  } else {
    // 없으면 추가
    const { error: insertError } = await client.from("wishlists").insert({
      user_id: userId,
      domain_id: domainId,
    });

    if (insertError) throw new Error(insertError.message);
    return { action: "added" };
  }
}
