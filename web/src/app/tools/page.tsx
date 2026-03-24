"use client";

import Link from "next/link";
import { Search, Sparkles, ArrowRight, Network, FileSearch, DollarSign } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BulkAnalysis } from "@/components/tools/bulk-analysis";
import { DomainCompare } from "@/components/tools/domain-compare";
import { TldStats } from "@/components/tools/tld-stats";

const TOOL_CARDS = [
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
    desc: "키워드만 입력하면 사업에 맞는 도메인 이름을 추천",
  },
  {
    href: "/tools/dns-checker",
    icon: Network,
    title: "DNS 조회",
    desc: "A, CNAME, MX, TXT, NS 레코드를 즉시 조회하고 DNS 전파 상태 확인",
  },
  {
    href: "/tools/whois-lookup",
    icon: FileSearch,
    title: "WHOIS 조회",
    desc: "도메인 소유자, 등록일, 만료일, 등록기관을 즉시 조회",
  },
  {
    href: "/tools/domain-value",
    icon: DollarSign,
    title: "도메인 가치 평가",
    desc: "도메인 길이, 확장자, 문자 구성을 분석해 예상 시장 가치를 추정",
  },
];

export default function ToolsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-3xl font-bold tracking-tight">무료 도메인 도구 모음</h1>
      <p className="mt-2 text-muted-foreground">
        도메인 비교, 벌크 분석, TLD별 통계를 한 곳에서 확인하세요. 도메인 구매 전 여러 도메인을 한번에 비교하고 분석할 수 있습니다.
      </p>

      {/* New tool cards */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {TOOL_CARDS.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="group flex items-start gap-4 rounded-xl border p-5 transition-colors hover:border-primary/40 hover:bg-muted/30"
          >
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

      <Tabs defaultValue="bulk" className="mt-8">
        <TabsList className="h-12 w-full justify-start gap-1">
          <TabsTrigger value="bulk" className="h-10 px-6 text-base">
            벌크 분석
          </TabsTrigger>
          <TabsTrigger value="compare" className="h-10 px-6 text-base">
            도메인 비교
          </TabsTrigger>
          <TabsTrigger value="tld" className="h-10 px-6 text-base">
            TLD 통계
          </TabsTrigger>
        </TabsList>

        <TabsContent value="bulk" className="mt-6">
          <BulkAnalysis />
        </TabsContent>

        <TabsContent value="compare" className="mt-6">
          <DomainCompare />
        </TabsContent>

        <TabsContent value="tld" className="mt-6">
          <TldStats />
        </TabsContent>
      </Tabs>
    </div>
  );
}
