"use client";

import Link from "next/link";
import { Search, Sparkles, ArrowRight } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BulkAnalysis } from "@/components/tools/bulk-analysis";
import { DomainCompare } from "@/components/tools/domain-compare";
import { TldStats } from "@/components/tools/tld-stats";

const TOOL_CARDS = [
  {
    href: "/tools/domain-availability",
    icon: Search,
    title: "도메인 가용성 확인",
    desc: "원하는 도메인 이름이 등록 가능한지 다양한 확장자를 한 번에 확인",
  },
  {
    href: "/tools/domain-generator",
    icon: Sparkles,
    title: "AI 도메인 이름 생성기",
    desc: "키워드를 입력하면 최적의 도메인 이름을 추천",
  },
];

export default function ToolsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-3xl font-bold tracking-tight">분석 도구</h1>
      <p className="mt-2 text-muted-foreground">
        도메인 벌크 분석, 비교, TLD별 통계를 확인하세요.
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
