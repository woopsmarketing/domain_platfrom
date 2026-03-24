import type { Metadata } from "next";
import Link from "next/link";
import { Globe, Search, Gavel, BookOpen, ChevronDown, ArrowRight, Server, Shield, RefreshCw, AlertTriangle, CheckCircle2, Network } from "lucide-react";
import { DnsCheckerClient } from "@/components/tools/dns-checker-client";

export const metadata: Metadata = {
  title: "DNS 조회 · DNS 전파 확인 — 무료 DNS 체커",
  description:
    "도메인의 DNS 레코드를 즉시 조회하세요. A, AAAA, CNAME, MX, TXT, NS 레코드를 한 번에 확인하고, DNS 전파 상태까지 파악할 수 있는 무료 DNS 체커입니다.",
  keywords: [
    "DNS 조회", "DNS 체커", "DNS checker", "DNS 확인", "DNS 전파 확인",
    "DNS propagation checker", "DNS 레코드 조회", "네임서버 확인", "네임서버 조회",
    "A 레코드 조회", "MX 레코드 조회", "CNAME 조회", "TXT 레코드 조회",
    "도메인 DNS 확인", "도메인 DNS 조회", "DNS 설정 확인", "DNS 상태 확인",
    "도메인 연결 상태 확인", "도메인 IP 조회", "도메인 서버 IP 확인",
  ],
  openGraph: {
    title: "DNS 조회 · DNS 전파 확인 — 무료 DNS 체커",
    description: "도메인 DNS 레코드를 즉시 조회하고 전파 상태를 확인하세요.",
    type: "website",
    siteName: "도메인체커",
  },
};

const FAQ_ITEMS = [
  {
    q: "DNS란 무엇인가요?",
    a: "DNS(Domain Name System)는 도메인 이름을 IP 주소로 변환하는 시스템입니다. 사람이 읽을 수 있는 도메인(예: google.com)을 컴퓨터가 이해하는 숫자 주소(예: 142.250.196.110)로 바꿔줍니다.",
  },
  {
    q: "DNS 전파란 무엇인가요?",
    a: "DNS 전파는 DNS 설정을 변경한 후, 전 세계 DNS 서버에 변경 내용이 반영되는 과정입니다. 보통 수 분에서 최대 48시간까지 소요될 수 있습니다. 전파가 완료되기 전까지는 일부 지역에서 이전 설정이 보일 수 있습니다.",
  },
  {
    q: "A 레코드와 CNAME 레코드의 차이는 무엇인가요?",
    a: "A 레코드는 도메인을 IP 주소에 직접 연결합니다. CNAME 레코드는 도메인을 다른 도메인 이름에 연결하는 별칭입니다. 예를 들어 www.example.com을 example.com으로 연결할 때 CNAME을 사용합니다.",
  },
  {
    q: "MX 레코드는 무엇인가요?",
    a: "MX(Mail Exchange) 레코드는 도메인의 이메일을 어떤 메일 서버로 보낼지 지정하는 레코드입니다. Gmail이나 네이버 메일 등 이메일 서비스를 도메인에 연결할 때 필요합니다.",
  },
  {
    q: "DNS 설정이 반영되지 않을 때 어떻게 하나요?",
    a: "DNS 전파에는 시간이 필요합니다. 변경 후 최대 48시간까지 기다려 보세요. 캐시 문제일 수 있으므로 브라우저 캐시를 삭제하거나, 이 도구를 통해 현재 DNS 상태를 확인해보세요.",
  },
  {
    q: "네임서버를 변경하면 사이트가 중단되나요?",
    a: "네임서버 변경 시 DNS 전파 기간 동안 일시적으로 접속이 불안정할 수 있습니다. 미리 새 네임서버에 동일한 DNS 레코드를 설정해두면 중단 없이 전환할 수 있습니다.",
  },
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
  { href: "/", label: "도메인 분석", desc: "도메인 점수와 이력을 무료로 분석", icon: Globe },
  { href: "/tools/domain-availability", label: "도메인 이름 검색", desc: "등록 가능한 도메인 즉시 확인", icon: Search },
  { href: "/auctions", label: "도메인 경매", desc: "진행 중인 도메인 경매 확인", icon: Gavel },
  { href: "/blog/what-is-da", label: "도메인 점수란?", desc: "도메인 점수의 의미 이해하기", icon: BookOpen },
];

const DNS_RECORD_TYPES = [
  { type: "A", desc: "도메인을 IPv4 주소에 연결", example: "93.184.216.34", use: "웹사이트 호스팅의 기본 레코드" },
  { type: "AAAA", desc: "도메인을 IPv6 주소에 연결", example: "2606:2800:220:1:248:...", use: "IPv6 지원 서버 연결" },
  { type: "CNAME", desc: "도메인을 다른 도메인으로 연결 (별칭)", example: "www → example.com", use: "서브도메인 설정, CDN 연결" },
  { type: "MX", desc: "이메일 수신 서버 지정", example: "mail.example.com (우선순위 10)", use: "Gmail, 네이버 메일 등 연결" },
  { type: "TXT", desc: "텍스트 정보 저장 (인증용)", example: "v=spf1 include:...", use: "SPF, DKIM, DMARC 이메일 인증" },
  { type: "NS", desc: "네임서버 지정", example: "ns1.example.com", use: "도메인 DNS 관리 서버 지정" },
];

export default function DnsCheckerPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_JSON_LD) }} />

      <div className="mx-auto max-w-4xl px-4 py-12">
        {/* Hero */}
        <section className="text-center">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            DNS 조회 ·{" "}
            <span className="bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
              DNS 전파 확인
            </span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
            도메인의 DNS 레코드를 즉시 조회하세요. A, CNAME, MX, TXT, NS 레코드를
            한 번에 확인하고 DNS 설정이 제대로 되어있는지 점검할 수 있습니다.
          </p>
        </section>

        {/* DNS Checker Tool */}
        <section className="mt-10">
          <DnsCheckerClient />
        </section>

        {/* DNS 레코드 종류 가이드 */}
        <section className="mt-16">
          <h2 className="text-2xl font-bold tracking-tight">DNS 레코드 종류 한눈에 보기</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            각 DNS 레코드의 역할과 용도를 이해하면 도메인 설정이 쉬워집니다.
          </p>
          <div className="mt-6 overflow-x-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40">
                  <th className="px-4 py-3 text-left font-semibold">레코드</th>
                  <th className="px-4 py-3 text-left font-semibold">설명</th>
                  <th className="px-4 py-3 text-left font-semibold hidden sm:table-cell">예시</th>
                  <th className="px-4 py-3 text-left font-semibold hidden md:table-cell">용도</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {DNS_RECORD_TYPES.map((r) => (
                  <tr key={r.type} className="hover:bg-muted/30">
                    <td className="px-4 py-3 font-mono font-semibold text-primary">{r.type}</td>
                    <td className="px-4 py-3 text-muted-foreground">{r.desc}</td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground hidden sm:table-cell">{r.example}</td>
                    <td className="px-4 py-3 text-muted-foreground text-xs hidden md:table-cell">{r.use}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* DNS 설정 체크리스트 */}
        <section className="mt-16">
          <h2 className="text-2xl font-bold tracking-tight">도메인 DNS 설정 체크리스트</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            도메인을 새로 연결하거나 이전할 때 아래 항목을 확인하세요.
          </p>
          <div className="mt-6 rounded-lg border">
            <div className="grid divide-y sm:grid-cols-2 sm:divide-x sm:divide-y-0">
              {[
                { items: ["A 레코드가 올바른 서버 IP를 가리키는가?", "네임서버가 정확히 설정되었는가?", "MX 레코드로 이메일이 수신되는가?", "SPF/DKIM/DMARC 이메일 인증이 설정되었는가?"] },
                { items: ["CNAME이 올바른 대상을 가리키는가?", "SSL 인증서가 도메인에 적용되었는가?", "DNS 전파가 완료되었는가?", "이전 DNS 레코드가 정리되었는가?"] },
              ].map((col, ci) => (
                <ul key={ci} className="divide-y">
                  {col.items.map((item) => (
                    <li key={item} className="flex items-center gap-3 px-5 py-3.5 text-sm">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-green-500" />
                      {item}
                    </li>
                  ))}
                </ul>
              ))}
            </div>
          </div>
        </section>

        {/* DNS 문제 해결 가이드 */}
        <section className="mt-16">
          <h2 className="text-2xl font-bold tracking-tight">DNS 문제가 발생했을 때</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            도메인 연결 문제의 대부분은 DNS 설정 오류에서 시작됩니다.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: RefreshCw, title: "사이트가 안 열려요", desc: "A 레코드가 올바른 서버 IP를 가리키고 있는지 확인하세요. DNS 전파 중이라면 최대 48시간까지 기다려야 합니다." },
              { icon: Shield, title: "이메일이 안 와요", desc: "MX 레코드가 메일 서버를 정확히 가리키는지 확인하세요. SPF, DKIM 레코드도 함께 점검하면 스팸 분류를 예방할 수 있습니다." },
              { icon: AlertTriangle, title: "SSL 오류가 나요", desc: "도메인과 SSL 인증서의 도메인이 일치하는지, CNAME이나 A 레코드가 올바른지 확인하세요." },
              { icon: Server, title: "네임서버 변경 후 접속 불가", desc: "새 네임서버에 기존 DNS 레코드를 미리 복사해두었는지 확인하세요. 전파에 최대 48시간 소요됩니다." },
              { icon: Network, title: "서브도메인이 작동 안 해요", desc: "서브도메인에 대한 A 레코드나 CNAME 레코드가 설정되어 있는지 확인하세요." },
              { icon: RefreshCw, title: "변경한 DNS가 반영 안 돼요", desc: "DNS 캐시 때문일 수 있습니다. 브라우저 캐시를 삭제하고, 이 도구로 현재 전파 상태를 확인해보세요." },
            ].map((item) => (
              <div key={item.title} className="rounded-lg border p-5">
                <item.icon className="mb-3 h-5 w-5 text-primary" />
                <h3 className="font-semibold">{item.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
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

        {/* Related tools */}
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
