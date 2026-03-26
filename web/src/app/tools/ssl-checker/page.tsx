import type { Metadata } from "next";
import Link from "next/link";
import { Globe, Gavel, Search, BookOpen, ChevronDown, ArrowRight, Shield, CheckCircle2 } from "lucide-react";
import { SslCheckerClient } from "@/components/tools/ssl-checker-client";

export const metadata: Metadata = {
  title: "SSL 인증서 확인 — 도메인 HTTPS 보안 상태 점검",
  description:
    "도메인의 SSL 인증서 유효 기간, 발급 기관, 보안 프로토콜을 무료로 확인하세요. 웹사이트 보안 상태를 즉시 점검할 수 있습니다.",
  keywords: [
    "SSL 확인", "SSL 인증서 확인", "SSL checker", "HTTPS 확인", "SSL 만료일 확인",
    "인증서 확인", "SSL 인증서 조회", "도메인 보안 확인", "SSL 유효성 검사",
    "사이트 보안 점검", "HTTPS 보안 확인", "SSL 발급기관 확인", "무료 SSL 체커",
  ],
  openGraph: {
    title: "SSL 인증서 확인 — 도메인 보안 상태 점검",
    description: "도메인의 SSL 인증서를 무료로 확인하세요.",
    type: "website",
    siteName: "도메인체커",
  },
};

const FAQ_ITEMS = [
  { q: "SSL 인증서란 무엇인가요?", a: "SSL(Secure Sockets Layer) 인증서는 웹사이트와 방문자 사이의 데이터를 암호화하는 디지털 인증서입니다. HTTPS로 시작하는 사이트는 SSL이 적용된 것이며, 브라우저 주소창에 자물쇠 아이콘이 표시됩니다." },
  { q: "SSL이 만료되면 어떻게 되나요?", a: "SSL이 만료되면 브라우저가 '안전하지 않은 사이트' 경고를 표시합니다. 방문자가 이탈하고 검색엔진 순위도 하락할 수 있으므로 만료 전에 갱신해야 합니다." },
  { q: "SSL은 SEO에 영향을 미치나요?", a: "네, 구글은 HTTPS를 순위 신호로 사용합니다. SSL이 없는 사이트는 검색 순위에서 불이익을 받을 수 있습니다." },
  { q: "무료 SSL과 유료 SSL의 차이는?", a: "Let's Encrypt 같은 무료 SSL은 암호화 기능은 동일하지만, EV(Extended Validation) 인증서처럼 회사 정보를 표시하는 기능은 없습니다. 일반적인 웹사이트는 무료 SSL로 충분합니다." },
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
  { href: "/tools/dns-checker", label: "DNS 조회", desc: "DNS 레코드와 전파 상태 확인", icon: Globe },
  { href: "/tools/domain-expiry", label: "만료일 확인", desc: "도메인 만료 예정일 조회", icon: Search },
  { href: "/auctions", label: "도메인 경매", desc: "진행 중인 도메인 경매 확인", icon: Gavel },
  { href: "/", label: "도메인 분석", desc: "도메인 점수와 이력을 무료로 분석", icon: BookOpen },
];

export default function SslCheckerPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_JSON_LD) }} />
      <div className="mx-auto max-w-4xl px-4 py-12">
        <section className="text-center">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            SSL 인증서{" "}
            <span className="bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">보안 점검</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
            도메인의 SSL 인증서 유효 기간, 발급 기관, 보안 프로토콜을 즉시 확인하세요.
          </p>
        </section>
        <section className="mt-10"><SslCheckerClient /></section>

        <section className="mt-16">
          <h2 className="text-2xl font-bold tracking-tight">SSL 인증서에서 확인할 수 있는 정보</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: Shield, title: "인증서 유효 기간", desc: "SSL 인증서가 언제 만료되는지 확인하여 사이트 접속 장애를 예방합니다." },
              { icon: CheckCircle2, title: "발급 기관", desc: "어떤 인증 기관(CA)에서 발급한 인증서인지 확인합니다." },
              { icon: Globe, title: "보안 프로토콜", desc: "TLS 1.2, TLS 1.3 등 어떤 보안 프로토콜이 사용되고 있는지 확인합니다." },
            ].map((item) => (
              <div key={item.title} className="rounded-lg border p-5">
                <item.icon className="mb-3 h-5 w-5 text-primary" />
                <h3 className="font-semibold">{item.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>


        {/* SSL이 중요한 이유 */}
        <section className="mt-16">
          <h2 className="text-2xl font-bold tracking-tight">SSL 인증서가 중요한 이유</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            SSL은 단순한 보안 기능을 넘어 웹사이트의 신뢰도와 검색 순위에 직접적인 영향을 미칩니다.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { title: "SEO 랭킹 요소", desc: "구글은 2014년부터 HTTPS를 검색 순위 신호로 사용하고 있습니다. SSL이 없는 사이트는 검색 결과에서 불이익을 받을 수 있습니다." },
              { title: "사용자 신뢰도", desc: "브라우저 주소창의 자물쇠 아이콘은 방문자에게 안전한 사이트라는 신호를 줍니다. SSL이 없으면 \'안전하지 않음\' 경고가 표시됩니다." },
              { title: "데이터 보호", desc: "SSL은 사용자가 입력하는 비밀번호, 개인정보, 결제 정보 등을 암호화하여 중간에서 탈취할 수 없도록 보호합니다." },
              { title: "브라우저 경고 방지", desc: "SSL이 없거나 만료되면 Chrome, Firefox 등 주요 브라우저가 경고 페이지를 표시하여 방문자가 이탈합니다." },
              { title: "결제 시스템 필수", desc: "온라인 결제를 처리하려면 SSL 인증서가 반드시 필요합니다. PCI DSS 규정에서 HTTPS를 의무화하고 있습니다." },
              { title: "도메인 가치 판단", desc: "중고 도메인 구매 시 SSL 인증서 상태를 확인하면 해당 도메인의 관리 수준과 활용 이력을 파악할 수 있습니다." },
            ].map((item) => (
              <div key={item.title} className="rounded-lg border p-5">
                <h3 className="font-semibold">{item.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* SSL 인증서 종류 비교 */}
        <section className="mt-16">
          <h2 className="text-2xl font-bold tracking-tight">SSL 인증서 종류 비교</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            용도에 맞는 SSL 인증서를 선택하세요.
          </p>
          <div className="mt-6 overflow-x-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40">
                  <th className="px-4 py-3 text-left font-semibold">종류</th>
                  <th className="px-4 py-3 text-left font-semibold">인증 수준</th>
                  <th className="px-4 py-3 text-left font-semibold hidden sm:table-cell">비용</th>
                  <th className="px-4 py-3 text-left font-semibold hidden md:table-cell">적합 대상</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {[
                  { type: "DV (Domain Validation)", level: "도메인 소유 확인", cost: "무료~$50/년", target: "개인 블로그, 소규모 사이트" },
                  { type: "OV (Organization Validation)", level: "조직 실재 확인", cost: "$50~$200/년", target: "기업 웹사이트, 비영리 단체" },
                  { type: "EV (Extended Validation)", level: "확장 검증 (최고 수준)", cost: "$100~$500/년", target: "은행, 전자상거래, 대기업" },
                  { type: "와일드카드 (Wildcard)", level: "서브도메인 전체 보호", cost: "$100~$300/년", target: "서브도메인이 많은 서비스" },
                ].map((row) => (
                  <tr key={row.type} className="hover:bg-muted/30">
                    <td className="px-4 py-3 font-medium">{row.type}</td>
                    <td className="px-4 py-3 text-muted-foreground">{row.level}</td>
                    <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{row.cost}</td>
                    <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{row.target}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* SSL 체크리스트 */}
        <section className="mt-16">
          <h2 className="text-2xl font-bold tracking-tight">SSL 보안 체크리스트</h2>
          <div className="mt-6 rounded-lg border">
            <ul className="divide-y">
              {[
                "SSL 인증서가 유효 기간 내인가?",
                "TLS 1.2 이상 프로토콜을 사용하고 있는가?",
                "인증서의 도메인과 실제 도메인이 일치하는가?",
                "HTTP에서 HTTPS로 자동 리다이렉트 되는가?",
                "혼합 콘텐츠(Mixed Content) 경고가 없는가?",
                "인증서 체인이 올바르게 설정되었는가?",
              ].map((item) => (
                <li key={item} className="flex items-center gap-3 px-5 py-3.5 text-sm">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-green-500" />
                  {item}
                </li>
              ))}
            </ul>
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
