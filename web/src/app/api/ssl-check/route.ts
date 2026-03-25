import { NextRequest, NextResponse } from "next/server";
import * as tls from "tls";

export async function GET(request: NextRequest) {
  const domain = request.nextUrl.searchParams.get("domain");
  if (!domain || !domain.includes(".")) {
    return NextResponse.json({ error: "도메인이 필요합니다" }, { status: 400 });
  }

  const clean = domain.replace(/^https?:\/\//, "").replace(/\/.*$/, "").replace(/^www\./, "");

  return new Promise<NextResponse>((resolve) => {
    const socket = tls.connect(
      { host: clean, port: 443, servername: clean, rejectUnauthorized: false, timeout: 5000 },
      () => {
        const cert = socket.getPeerCertificate();
        socket.destroy();

        if (!cert || !cert.subject) {
          resolve(NextResponse.json({ error: "인증서를 가져올 수 없습니다" }, { status: 404 }));
          return;
        }

        resolve(NextResponse.json({
          subject: cert.subject?.CN ?? "",
          issuer: cert.issuer?.O ?? cert.issuer?.CN ?? "",
          validFrom: cert.valid_from,
          validTo: cert.valid_to,
          serialNumber: cert.serialNumber,
          fingerprint: cert.fingerprint256,
          subjectAltNames: (cert.subjectaltname ?? "").split(", ").map((s: string) => s.replace("DNS:", "")),
          protocol: socket.getProtocol(),
        }));
      }
    );

    socket.on("error", () => {
      socket.destroy();
      resolve(NextResponse.json({ error: "SSL 연결 실패. 도메인에 HTTPS가 설정되지 않았거나 접속할 수 없습니다." }, { status: 502 }));
    });

    socket.setTimeout(5000, () => {
      socket.destroy();
      resolve(NextResponse.json({ error: "연결 시간 초과" }, { status: 504 }));
    });
  });
}
