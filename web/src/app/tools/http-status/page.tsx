import type { Metadata } from "next";
import Link from "next/link";
import { Globe, Gavel, Search, BookOpen, ChevronDown, ArrowRight } from "lucide-react";
import { HttpStatusClient } from "@/components/tools/http-status-client";

export const metadata: Metadata = {
  title: "HTTP 상태 확인 — 사이트 접속 상태 · 리다이렉트 경로 추적",
  description:
    "도메인의 HTTP 상태 코드와 리다이렉트 경로를 확인하세요. 사이트가 정상 접속되는지, 어디로 리다이렉트되는지 즉시 파악할 수 있습니다.",
  keywords: [
    "HTTP 상태 확인", "사이트 접속 확인", "리다이렉트 확인", "리다이렉트 체커",
    "HTTP status checker", "301 리다이렉트 확인", "302 리다이렉트", "사이트 다운 확인",
    "도메인 접속 확인", "도메인 리다이렉트", "웹사이트 상태 확인", "도메인 파킹 확인",
  ],
  openGraph: {
    title: "HTTP 상태 확인 — 사이트 접속 · 리다이렉트 추적",
    description: "도메인 HTTP 상태 코드와 리다이렉트 경로를 즉시 확인하세요.",
    type: "website",
    siteName: "도메인체커",
  },
};

const FAQ_ITEMS = [
  { q: "HTTP 상태 코드란?", a: "HTTP 상태 코드는 웹서버가 요청에 대해 반환하는 3자리 숫자 코드입니다. 200은 정상, 301은 영구 이동, 404는 페이지 없음, 500은 서버 오류를 의미합니다." },
  { q: "301과 302 리다이렉트의 차이는?", a: "301은 영구 이동(SEO 가치 전달), 302는 임시 이동(SEO 가치 미전달)입니다. 도메인을 이전할 때는 301 리다이렉트를 사용해야 검색 순위를 유지할 수 있습니다." },
  { q: "도메인이 파킹 상태인지 어떻게 알 수 있나요?", a: "접속 시 광고만 표시되거나 등록기관 기본 페이지가 나오면 파킹 상태입니다. 만료 직전이거나 판매 대기 중인 도메인에서 흔히 볼 수 있습니다." },
  { q: "사이트가 접속되지 않는 이유는?", a: "DNS 미설정, 서버 다운, SSL 오류, 도메인 만료 등 여러 원인이 있습니다. DNS 조회와 SSL 확인 도구로 원인을 파악해보세요." },
];

const FAQ_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ_ITEMS.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: { "@type": "Answer", text: item.a },
  })),
};

const RELATED_LINKS = [
  { href: "/tools/ssl-checker", label: "SSL 인증서 확인", desc: "도메인 보안 상태 점검", icon: Globe },
  { href: "/tools/dns-checker", label: "DNS 조회", desc: "DNS 레코드와 전파 상태 확인", icon: Search },
  { href: "/tools/domain-expiry", label: "만료일 확인", desc: "도메인 만료 예정일 조회", icon: BookOpen },
  { href: "/auctions", label: "도메인 경매", desc: "진행 중인 도메인 경매 확인", icon: Gavel },
];

export default function HttpStatusPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_JSON_LD) }} />
      <div className="mx-auto max-w-4xl px-4 py-12">
        <section className="text-center">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            HTTP 상태 확인 ·{" "}
            <span className="bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">리다이렉트 추적</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
            도메인의 HTTP 상태 코드를 확인하고 리다이렉트 경로를 추적하세요.
            사이트 접속 여부와 파킹 상태를 즉시 파악할 수 있습니다.
          </p>
        </section>
        <section className="mt-10"><HttpStatusClient /></section>

        <section className="mt-16">
          <h2 className="text-2xl font-bold tracking-tight">주요 HTTP 상태 코드</h2>
          <div className="mt-6 overflow-x-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40">
                  <th className="px-4 py-3 text-left font-semibold">코드</th>
                  <th className="px-4 py-3 text-left font-semibold">의미</th>
                  <th className="px-4 py-3 text-left font-semibold hidden sm:table-cell">설명</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {[
                  { code: "200", label: "OK", desc: "정상 접속. 페이지가 올바르게 로드됩니다.", color: "text-green-600" },
                  { code: "301", label: "영구 이동", desc: "다른 URL로 영구 리다이렉트. SEO 가치 전달됨.", color: "text-blue-600" },
                  { code: "302", label: "임시 이동", desc: "다른 URL로 임시 리다이렉트. SEO 가치 미전달.", color: "text-amber-600" },
                  { code: "403", label: "접근 금지", desc: "서버가 요청을 거부함. 권한 문제.", color: "text-red-500" },
                  { code: "404", label: "찾을 수 없음", desc: "요청한 페이지가 존재하지 않음.", color: "text-red-500" },
                  { code: "500", label: "서버 오류", desc: "서버 내부 오류. 사이트 관리자 확인 필요.", color: "text-red-600" },
                  { code: "503", label: "서비스 불가", desc: "서버 과부하 또는 점검 중.", color: "text-red-600" },
                ].map((row) => (
                  <tr key={row.code} className="hover:bg-muted/30">
                    <td className={`px-4 py-2.5 font-mono font-semibold ${row.color}`}>{row.code}</td>
                    <td className="px-4 py-2.5 font-medium">{row.label}</td>
                    <td className="px-4 py-2.5 text-muted-foreground hidden sm:table-cell">{row.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-16">
          <h2 className="text-2xl font-bold tracking-tight">자주 묻는 질문</h2>
          <div className="mt-6 divide-y rounded-lg border">
            {FAQ_ITEMS.map((item, i) => (
              <details key={i} className="group">
                <summary className="flex cursor-pointer items-center justify-between px-5 py-4 text-sm font-medium hover:bg-muted/50">
                  {item.q}
                  <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
                </summary>
                <div className="px-5 pb-4 text-sm text-muted-foreground">{item.a}</div>
              </details>
            ))}
          </div>
        </section>

        <section className="mt-16">
          <h2 className="text-2xl font-bold tracking-tight">관련 도구</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {RELATED_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="group flex items-start gap-4 rounded-lg border p-5 transition-colors hover:border-primary/40 hover:bg-muted/30">
                <link.icon className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                <div className="flex-1">
                  <p className="font-medium group-hover:text-primary">{link.label}</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">{link.desc}</p>
                </div>
                <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1" />
              </Link>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
