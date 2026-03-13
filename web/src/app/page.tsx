import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DomainTable } from "@/components/domain/domain-table";
import { StatsOverview } from "@/components/domain/stats-overview";
import { mockAuctionDomains, mockExpiredDomains } from "@/lib/mock-data";

export default function HomePage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Stats */}
      <StatsOverview />

      {/* Domain Tabs */}
      <div className="mt-6">
        <Tabs defaultValue="auction">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="auction">경매 도메인</TabsTrigger>
              <TabsTrigger value="expired">만료 도메인</TabsTrigger>
              <TabsTrigger value="premium">프리미엄</TabsTrigger>
            </TabsList>
            <p className="hidden text-sm text-muted-foreground sm:block">
              실시간 업데이트 · GoDaddy, NameCheap, Dynadot
            </p>
          </div>

          <TabsContent value="auction" className="mt-4">
            <DomainTable domains={mockAuctionDomains} />
          </TabsContent>

          <TabsContent value="expired" className="mt-4">
            <DomainTable domains={mockExpiredDomains} />
          </TabsContent>

          <TabsContent value="premium" className="mt-4">
            <DomainTable domains={[]} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
