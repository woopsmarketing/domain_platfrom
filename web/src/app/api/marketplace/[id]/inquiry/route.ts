import { NextRequest, NextResponse } from "next/server";
import { createInquiry } from "@/lib/db/marketplace";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: listingId } = await params;

    if (!listingId) {
      return NextResponse.json({ error: "listing ID가 필요합니다" }, { status: 400 });
    }

    // UUID format validation
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(listingId)) {
      return NextResponse.json({ error: "유효하지 않은 listing ID입니다" }, { status: 400 });
    }

    const body: unknown = await req.json();
    if (typeof body !== "object" || body === null) {
      return NextResponse.json({ error: "올바른 JSON 형식이 필요합니다" }, { status: 400 });
    }

    const { name, email, message, offeredPrice } = body as Record<string, unknown>;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json({ error: "이름을 입력해주세요" }, { status: 400 });
    }
    if (name.length > 100) {
      return NextResponse.json({ error: "이름은 100자 이내여야 합니다" }, { status: 400 });
    }

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "이메일을 입력해주세요" }, { status: 400 });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "유효한 이메일 주소를 입력해주세요" }, { status: 400 });
    }

    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return NextResponse.json({ error: "문의 내용을 입력해주세요" }, { status: 400 });
    }
    if (message.length > 1000) {
      return NextResponse.json({ error: "문의 내용은 1000자 이내여야 합니다" }, { status: 400 });
    }

    let parsedOfferedPrice: number | undefined;
    if (offeredPrice !== undefined) {
      parsedOfferedPrice = Number(offeredPrice);
      if (!isFinite(parsedOfferedPrice) || parsedOfferedPrice <= 0) {
        return NextResponse.json({ error: "제안 가격은 양수여야 합니다" }, { status: 400 });
      }
    }

    await createInquiry(listingId, {
      name: name.trim(),
      email: email.trim(),
      message: message.trim(),
      offeredPrice: parsedOfferedPrice,
    });

    return NextResponse.json({ data: { message: "문의가 접수되었습니다" } }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/marketplace/[id]/inquiry] error:", error);
    return NextResponse.json({ error: "처리 중 오류가 발생했습니다" }, { status: 500 });
  }
}
