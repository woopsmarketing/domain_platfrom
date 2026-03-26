import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase";

export async function POST() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = createServiceClient();
    const { data: sub } = await client
      .from("subscriptions")
      .select("lemon_customer_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!sub?.lemon_customer_id) {
      return NextResponse.json({ error: "No subscription" }, { status: 404 });
    }

    const apiKey = process.env.LEMONSQUEEZY_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "API key not configured" }, { status: 500 });
    }

    const res = await fetch(
      `https://api.lemonsqueezy.com/v1/customers/${sub.lemon_customer_id}`,
      {
        headers: {
          Accept: "application/vnd.api+json",
          Authorization: `Bearer ${apiKey}`,
        },
      }
    );

    if (!res.ok) {
      return NextResponse.json({ error: "Failed to fetch customer" }, { status: 500 });
    }

    const json = await res.json();
    const portalUrl = json.data.attributes.urls.customer_portal;

    return NextResponse.json({ url: portalUrl });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
