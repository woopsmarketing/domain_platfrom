"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BulkAnalysis } from "@/components/tools/bulk-analysis";
import { DomainCompare } from "@/components/tools/domain-compare";
import { TldStats } from "@/components/tools/tld-stats";

export default function ToolsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-3xl font-bold tracking-tight">분석 도구</h1>
      <p className="mt-2 text-muted-foreground">
        도메인 벌크 분석, 비교, TLD별 통계를 확인하세요.
      </p>

      <Tabs defaultValue="bulk" className="mt-6">
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
