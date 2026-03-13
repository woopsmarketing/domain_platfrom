import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DomainTable } from "@/components/domain/domain-table";
import { StatsOverview } from "@/components/domain/stats-overview";
import { getDomains } from "@/lib/db/domains";
import type { DomainListItem } from "@/types/domain";

async function fetchTab(tab: "auction" | "expired" | "premium"): Promise<DomainListItem[]> {
  try {
    const { data } = await getDomains({ tab, limit: 100 });
    return data;
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const [auctionDomains, expiredDomains, premiumDomains] = await Promise.all([
    fetchTab("auction"),
    fetchTab("expired"),
    fetchTab("premium"),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Stats */}
      <StatsOverview />

      {/* Domain Tabs */}
      <div className="mt-6">
        <Tabs defaultValue="auction">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="auction">
                경매 도메인 {auctionDomains.length > 0 && `(${auctionDomains.length})`}
              </TabsTrigger>
              <TabsTrigger value="expired">
                만료 도메인 {expiredDomains.length > 0 && `(${expiredDomains.length})`}
              </TabsTrigger>
              <TabsTrigger value="premium">프리미엄</TabsTrigger>
            </TabsList>
            <p className="hidden text-sm text-muted-foreground sm:block">
              실시간 업데이트 · GoDaddy, NameCheap, Dynadot
            </p>
          </div>

          <TabsContent value="auction" className="mt-4">
            <DomainTable domains={auctionDomains} />
          </TabsContent>

          <TabsContent value="expired" className="mt-4">
            <DomainTable domains={expiredDomains} />
          </TabsContent>

          <TabsContent value="premium" className="mt-4">
            <DomainTable domains={premiumDomains} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
