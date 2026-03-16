import type { Metadata } from "next";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DomainTable } from "@/components/domain/domain-table";
import { StatsOverview } from "@/components/domain/stats-overview";
import { getDomains } from "@/lib/db/domains";
import type { DomainListItem } from "@/types/domain";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "도메인 낙찰 이력 — GoDaddy, Namecheap 거래 데이터",
  description:
    "GoDaddy, Namecheap 경매에서 실제 낙찰된 도메인의 거래 가격과 SEO 지수를 확인하세요. 매일 업데이트되는 도메인 낙찰 데이터.",
  keywords: [
    "도메인 낙찰 이력",
    "도메인 거래 가격",
    "GoDaddy 낙찰 도메인",
    "Namecheap 경매 결과",
    "도메인 경매 데이터",
    "도메인 판매 이력",
    "도메인 거래 시세",
  ],
};

async function fetchTab(tab: "recent" | "highvalue" | "all"): Promise<DomainListItem[]> {
  try {
    const { data } = await getDomains({ tab, limit: 100 });
    return data;
  } catch {
    return [];
  }
}

export default async function MarketHistoryPage() {
  const [recentDomains, highValueDomains, allDomains] = await Promise.all([
    fetchTab("recent"),
    fetchTab("highvalue"),
    fetchTab("all"),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">도메인 낙찰 이력</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          매일 업데이트되는 GoDaddy, Namecheap 낙찰 데이터
        </p>
      </div>

      <StatsOverview />

      <div className="mt-6">
        <Tabs defaultValue="recent">
          <div className="flex items-center justify-between">
            <TabsList className="h-11">
              <TabsTrigger value="recent" className="px-4 py-2 text-base">
                최근 낙찰 {recentDomains.length > 0 && `(${recentDomains.length})`}
              </TabsTrigger>
              <TabsTrigger value="highvalue" className="px-4 py-2 text-base">
                고가 낙찰 {highValueDomains.length > 0 && `(${highValueDomains.length})`}
              </TabsTrigger>
              <TabsTrigger value="all" className="px-4 py-2 text-base">전체</TabsTrigger>
            </TabsList>
            <p className="hidden text-sm text-muted-foreground sm:block">
              매일 업데이트 · GoDaddy, Namecheap 낙찰 데이터
            </p>
          </div>

          <TabsContent value="recent" className="mt-4">
            <DomainTable domains={recentDomains} />
          </TabsContent>

          <TabsContent value="highvalue" className="mt-4">
            <DomainTable domains={highValueDomains} />
          </TabsContent>

          <TabsContent value="all" className="mt-4">
            <DomainTable domains={allDomains} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
