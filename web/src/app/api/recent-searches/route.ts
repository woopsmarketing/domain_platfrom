import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";

export async function GET() {
  try {
    const client = createServiceClient();
    const { data } = await client
      .from("domains")
      .select("id, name, tld, last_searched_at")
      .not("last_searched_at", "is", null)
      .order("last_searched_at", { ascending: false })
      .limit(10);

    return NextResponse.json({ items: data ?? [] });
  } catch {
    return NextResponse.json({ items: [] });
  }
}
