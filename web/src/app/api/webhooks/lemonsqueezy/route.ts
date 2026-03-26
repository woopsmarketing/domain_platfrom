export const runtime = "nodejs";

import { createHmac } from "crypto";
import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";

async function verifyWebhook(
  rawBody: string,
  signature: string
): Promise<boolean> {
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
  if (!secret) return false;
  const hmac = createHmac("sha256", secret);
  const digest = hmac.update(rawBody).digest("hex");
  return signature === digest;
}

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-signature") ?? "";

  const valid = await verifyWebhook(rawBody, signature);
  if (!valid) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let payload: {
    meta: {
      event_name: string;
      custom_data?: { user_id?: string };
    };
    data: {
      id: string;
      attributes: {
        store_id: number;
        customer_id: number;
        status: string;
        variant_id: number;
        renews_at: string | null;
        ends_at: string | null;
      };
    };
  };

  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { meta, data } = payload;
  const userId = meta.custom_data?.user_id;
  const eventName = meta.event_name;
  const attrs = data.attributes;

  if (!userId) {
    console.error("LemonSqueezy webhook: missing user_id in custom_data");
    return NextResponse.json({ error: "Missing user_id" }, { status: 400 });
  }

  const supabase = createServiceClient();
  const monthlyVariantId = process.env.LEMON_MONTHLY_VARIANT_ID;
  const planType =
    String(attrs.variant_id) === monthlyVariantId ? "monthly" : "yearly";

  try {
    switch (eventName) {
      case "subscription_created":
      case "subscription_updated":
      case "subscription_payment_success": {
        const isActive = attrs.status === "active";
        await supabase.from("subscriptions").upsert(
          {
            user_id: userId,
            tier: isActive ? "pro" : "free",
            plan_type: planType,
            lemon_subscription_id: String(data.id),
            lemon_customer_id: String(attrs.customer_id),
            started_at: new Date().toISOString(),
            expires_at: attrs.renews_at || attrs.ends_at,
            cancel_at:
              attrs.status === "cancelled"
                ? attrs.ends_at || attrs.renews_at
                : null,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id" }
        );
        break;
      }
      case "subscription_cancelled": {
        await supabase.from("subscriptions").upsert(
          {
            user_id: userId,
            tier: "pro", // 구독 기간 끝까지 유지
            plan_type: planType,
            lemon_subscription_id: String(data.id),
            lemon_customer_id: String(attrs.customer_id),
            cancel_at: attrs.ends_at || attrs.renews_at,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id" }
        );
        break;
      }
      case "subscription_expired": {
        await supabase.from("subscriptions").upsert(
          {
            user_id: userId,
            tier: "free",
            expires_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id" }
        );
        break;
      }
      default:
        console.log(`Unhandled LemonSqueezy event: ${eventName}`);
    }
  } catch (err) {
    console.error("Webhook DB error:", err);
    return NextResponse.json(
      { error: "Database update failed" },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
