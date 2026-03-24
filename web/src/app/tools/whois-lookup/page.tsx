import type { Metadata } from "next";
import Link from "next/link";
import { Globe, Search, Gavel, BookOpen, ChevronDown, ArrowRight, User, Calendar, Building2, Shield, FileText, CheckCircle2 } from "lucide-react";
import { WhoisLookupClient } from "@/components/tools/whois-lookup-client";

export const metadata: Metadata = {
  title: "WHOIS 조회 — 도메인 소유자 · 만료일 · 등록 정보 확인",
  description:
    "도메인의 소유자 정보, 등록일, 만료일, 등록기관을 무료로 조회하세요. 도메인 구매 전 꼭 확인해야 할 WHOIS 정보를 즉시 확인할 수 있습니다.",
  keywords: [
    "WHOIS 조회", "whois checker", "도메인 소유자 조회", "도메인 등록자 조회",
    "도메인 만료일 조회", "도메인 등록일 확인", "도메인 등록 정보 조회",
    "도메인 registrar 확인", "도메인 등록기관 조회", "도메인 생성일 조회",
    "도메인 whois 조회", "도메인 개인정보 보호 확인", "도메인 나이 확인",
    "도메인 age 확인", "IP whois 조회",
  ],
  openGraph: {
    title: "WHOIS 조회 — 도메인 소유자 · 만료일 확인",
    description: "도메인 소유자, 등록일, 만료일을 무료로 조회하세요.",
    type: "website",
    siteName: "도메인체커",
  },
};

const FAQ_ITEMS = [
  {
    q: "WHOIS란 무엇인가요?",
    a: "WHOIS는 도메인 이름의 등록 정보를 공개적으로 조회할 수 있는 프로토콜입니다. 도메인 소유자, 등록일, 만료일, 네임서버, 등록 기관 등의 정보를 확인할 수 있습니다.",
  },
  {
    q: "도메인 소유자 정보가 보이지 않는 경우가 있나요?",
    a: "네, 많은 도메인이 'WHOIS 프라이버시 보호' 서비스를 사용하고 있어 실제 소유자 정보 대신 프라이버시 서비스 업체의 정보가 표시됩니다. 이는 스팸이나 개인정보 노출을 방지하기 위한 정상적인 설정입니다.",
  },
  {
    q: "도메인 나이는 왜 중요한가요?",
    a: "도메인 나이는 SEO에서 중요한 신뢰 지표입니다. 오래된 도메인일수록 검색엔진이 더 신뢰하는 경향이 있습니다. 만료 도메인이나 경매 도메인을 구매할 때 도메인 나이를 확인하면 가치 판단에 도움이 됩니다.",
  },
  {
    q: "도메인 만료일은 어떻게 확인하나요?",
    a: "이 WHOIS 조회 도구에 도메인을 입력하면 만료일(Expiry Date)을 즉시 확인할 수 있습니다. 만료가 가까운 도메인은 경매에 나올 가능성이 있으므로 관심 있는 도메인의 만료일을 미리 체크해두세요.",
  },
  {
    q: "도메인 등록기관(Registrar)이란?",
    a: "도메인 등록기관은 도메인 이름을 등록하고 관리하는 업체입니다. GoDaddy, Namecheap, 가비아 등이 대표적인 등록기관입니다. 도메인 이전 시 현재 등록기관을 확인해야 합니다.",
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
  { href: "/tools/dns-checker", label: "DNS 조회", desc: "DNS 레코드와 전파 상태 확인", icon: Search },
  { href: "/auctions", label: "도메인 경매", desc: "진행 중인 도메인 경매 확인", icon: Gavel },
  { href: "/market-history", label: "도메인 거래 시세", desc: "실제 낙찰 가격 데이터 조회", icon: BookOpen },
];

const WHOIS_FIELDS = [
  { icon: User, field: "도메인 소유자", desc: "도메인을 등록한 개인 또는 기관. 프라이버시 보호 시 대리 정보가 표시됩니다." },
  { icon: Calendar, field: "등록일 / 만료일", desc: "도메인이 처음 등록된 날짜와 만료 예정일. 도메인 나이와 갱신 상태를 파악할 수 있습니다." },
  { icon: Building2, field: "등록기관 (Registrar)", desc: "도메인을 관리하는 업체. 도메인 이전이나 설정 변경 시 등록기관을 통해야 합니다." },
  { icon: Shield, field: "프라이버시 보호", desc: "소유자 정보를 숨기는 WHOIS 프라이버시 서비스 사용 여부를 확인합니다." },
  { icon: FileText, field: "네임서버 정보", desc: "도메인의 DNS를 관리하는 서버. 호스팅이나 DNS 서비스 제공자를 파악할 수 있습니다." },
];

export default function WhoisLookupPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_JSON_LD) }} />

      <div className="mx-auto max-w-4xl px-4 py-12">
        {/* Hero */}
        <section className="text-center">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            WHOIS 조회 —{" "}
            <span className="bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
              도메인 정보 확인
            </span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
            도메인의 소유자, 등록일, 만료일, 등록기관을 즉시 확인하세요.
            도메인 구매나 이전 전에 꼭 확인해야 할 정보입니다.
          </p>
        </section>

        {/* WHOIS Tool */}
        <section className="mt-10">
          <WhoisLookupClient />
        </section>

        {/* WHOIS에서 확인할 수 있는 정보 */}
        <section className="mt-16">
          <h2 className="text-2xl font-bold tracking-tight">WHOIS에서 확인할 수 있는 정보</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            도메인 구매, 이전, 경매 참여 전에 반드시 확인해야 할 핵심 정보들입니다.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {WHOIS_FIELDS.map((item) => (
              <div key={item.field} className="rounded-lg border p-5">
                <item.icon className="mb-3 h-5 w-5 text-primary" />
                <h3 className="font-semibold">{item.field}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 도메인 나이 확인이 중요한 이유 */}
        <section className="mt-16">
          <h2 className="text-2xl font-bold tracking-tight">도메인 나이 확인이 중요한 이유</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {[
              { title: "SEO 신뢰도", desc: "검색엔진은 오래된 도메인을 더 신뢰합니다. 같은 콘텐츠라도 도메인 나이가 오래될수록 검색 순위에 유리합니다." },
              { title: "투자 가치 판단", desc: "경매나 만료 도메인 구매 시, 도메인 나이가 오래된 것이 더 높은 가치를 가집니다. 등록일을 확인해 투자 가치를 판단하세요." },
              { title: "이력 파악", desc: "등록일과 만료일을 통해 도메인이 얼마나 꾸준히 유지되었는지, 중간에 만료된 적이 있는지 파악할 수 있습니다." },
            ].map((item) => (
              <div key={item.title} className="rounded-lg border p-5">
                <h3 className="font-semibold">{item.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* WHOIS 활용 체크리스트 */}
        <section className="mt-16">
          <h2 className="text-2xl font-bold tracking-tight">도메인 구매 전 WHOIS 체크리스트</h2>
          <div className="mt-6 rounded-lg border">
            <ul className="divide-y">
              {[
                "도메인 만료일이 충분히 남아있는가?",
                "소유자 정보가 신뢰할 수 있는가?",
                "등록기관이 안정적인 업체인가?",
                "도메인 나이가 충분한가? (오래된 도메인 = SEO 유리)",
                "프라이버시 보호가 활성화되어 있는가?",
                "네임서버가 정상적으로 설정되어 있는가?",
              ].map((item) => (
                <li key={item} className="flex items-center gap-3 px-5 py-3.5 text-sm">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-green-500" />
                  {item}
                </li>
              ))}
            </ul>
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
