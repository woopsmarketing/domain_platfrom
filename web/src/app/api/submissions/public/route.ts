import { NextResponse } from "next/server";

// 브라우저 확장(Grammarly 등)이 폴링하는 엔드포인트 — 204로 조용히 처리
export async function GET() {
  return new NextResponse(null, { status: 204 });
}
