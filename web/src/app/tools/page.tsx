"use client";

import Link from "next/link";
import {
  Search, Sparkles, ArrowRight, Network, FileSearch, DollarSign,
  Calendar, Shield, Activity, BarChart3, GitCompare, Star,
} from "lucide-react";

interface ToolCard {
  href: string;
  icon: React.ElementType;
  title: string;
  desc: string;
  popular?: boolean;
}

const TOOL_CARDS: ToolCard[] = [
  {
    href: "/tools/bulk-analysis",
    icon: BarChart3,
    title: "벌크 분석",
    desc: "여러 도메인을 한번에 입력하면 검색 점수, 백링크를 일괄 분석",
    popular: true,
  },
  {
    href: "/tools/domain-compare",
    icon: GitCompare,
    title: "도메인 비교",
    desc: "2~3개 도메인을 나란히 비교하여 어떤 도메인이 더 좋은지 판단",
    popular: true,
  },
  {
    href: "/tools/domain-availability",
    icon: Search,
    title: "도메인 가용성 확인",
    desc: "사용하고 싶은 도메인 이름이 등록 가능한지 한 번에 확인",
  },
  {
    href: "/tools/domain-generator",
    icon: Sparkles,
    title: "AI 도메인 이름 생성기",
    desc: "키워드만 입력하면 AI가 사업에 맞는 도메인 이름을 추천",
    popular: true,
  },
  {
    href: "/tools/domain-value",
    icon: DollarSign,
    title: "도메인 가치 평가",
    desc: "도메인의 예상 시장 가치를 기본 + SEO 데이터 기반으로 평가",
  },
  {
    href: "/tools/dns-checker",
    icon: Network,
    title: "DNS 조회",
    desc: "A, CNAME, MX, TXT, NS 레코드를 즉시 조회",
  },
  {
    href: "/tools/whois-lookup",
    icon: FileSearch,
    title: "WHOIS 조회",
    desc: "도메인 소유자, 등록일, 만료일, 등록기관 조회",
  },
  {
    href: "/tools/domain-expiry",
    icon: Calendar,
    title: "도메인 만료일 확인",
    desc: "만료 예정일과 도메인 나이를 확인, 만료 시 경매 기회 포착",
  },
  {
    href: "/tools/ssl-checker",
    icon: Shield,
    title: "SSL 인증서 확인",
    desc: "SSL 인증서 유효 기간, 발급 기관, 보안 상태 점검",
  },
  {
    href: "/tools/http-status",
    icon: Activity,
    title: "HTTP 상태 확인",
    desc: "사이트 접속 상태와 리다이렉트 경로를 추적",
  },
];

export default function ToolsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-3xl font-bold tracking-tight">무료 도메인 도구 모음</h1>
      <p className="mt-2 text-muted-foreground">
        도메인 분석, 비교, 검색, 생성까지. 도메인에 관한 모든 도구를 무료로 사용하세요.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {TOOL_CARDS.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="group relative flex items-start gap-4 rounded-xl border p-5 transition-colors hover:border-primary/40 hover:bg-muted/30"
          >
            {card.popular && (
              <div className="absolute -top-2 -left-2 flex h-6 w-6 items-center justify-center rounded-full bg-amber-400 text-white shadow-sm">
                <Star className="h-3.5 w-3.5 fill-current" />
              </div>
            )}
            <card.icon className="mt-0.5 h-6 w-6 shrink-0 text-primary" />
            <div className="flex-1">
              <p className="font-semibold group-hover:text-primary">
                {card.title}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{card.desc}</p>
            </div>
            <ArrowRight className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1" />
          </Link>
        ))}
      </div>
    </div>
  );
}
