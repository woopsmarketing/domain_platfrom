import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, telegram, target_keyword, budget, message } = body;

    if (!name || !email || !target_keyword) {
      return NextResponse.json(
        { error: "필수 항목을 입력해주세요" },
        { status: 400 }
      );
    }

    const client = createServiceClient();
    const { error } = await client.from("broker_inquiries").insert({
      name,
      email,
      telegram: telegram || null,
      target_keyword,
      budget: budget || null,
      message: message || null,
    });

    if (error) {
      console.error("broker_inquiries insert error:", error);
      return NextResponse.json(
        { error: "문의 접수에 실패했습니다" },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "요청을 처리할 수 없습니다" },
      { status: 400 }
    );
  }
}
