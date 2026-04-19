import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { sendEmail } from "@/lib/email";
import { brokerConfirmation, brokerAdminNotification } from "@/lib/email-templates";

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

    // 사용자에게 접수 확인 이메일
    await sendEmail({
      to: email,
      toName: name,
      subject: "[도메인체커] 경매 대행 문의가 접수되었습니다",
      htmlContent: brokerConfirmation({
        name,
        targetKeyword: target_keyword,
        budget: budget || "미정",
      }),
    });

    // 어드민에게 알림
    await sendEmail({
      to: process.env.ADMIN_EMAIL ?? "vnfm0580@gmail.com",
      subject: "[도메인체커 어드민] 새 경매 대행 문의 접수",
      htmlContent: brokerAdminNotification({
        name,
        email,
        telegram: telegram || "",
        targetKeyword: target_keyword,
        budget: budget || "미정",
        message: message || "",
      }),
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "요청을 처리할 수 없습니다" },
      { status: 400 }
    );
  }
}
