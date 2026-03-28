import type { Metadata } from "next";
import Link from "next/link";
import { ShoppingBag, ChevronDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { createServiceClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "프리미엄 도메인 구매 — 검증된 도메인 판매 · 도메인 매매 | 도메인체커",
  description:
    "SEO 지표가 검증된 프리미엄 도메인을 합리적 가격에 구매하세요. DA, DR, 백링크가 확인된 도메인 매매 플랫폼.",
  keywords: [
    "프리미엄 도메인 구매",
    "도메인 판매",
    "도메인 매매",
    "도메인 구매",
    "프리미엄 도메인",
  ],
  openGraph: {
    title: "프리미엄 도메인 구매 — 검증된 도메인 매매 | 도메인체커",
    description:
      "SEO 지표가 검증된 프리미엄 도메인을 합리적 가격에 구매하세요.",
    type: "website",
    siteName: "도메인체커",
  },
};

interface Listing {
  id: string;
  domain_id: string;
  asking_price: number;
  description: string | null;
  is_negotiable: boolean;
  is_active: boolean;
  listed_at: string;
  domains: {
    name: string;
    tld: string;
  } | null;
  domain_metrics: {
    moz_da: number | null;
    ahrefs_dr: number | null;
  }[] | null;
}

async function getListings(): Promise<Listing[]> {
  try {
    const client = createServiceClient();
    const { data, error } = await client
      .from("marketplace_listings")
      .select("*, domains(name, tld), domain_metrics:domains!inner(domain_metrics(moz_da, ahrefs_dr))")
      .eq("is_active", true)
      .order("listed_at", { ascending: false });

    if (error) {
      // Fallback: simpler query without metrics join
      const { data: simpleData } = await client
        .from("marketplace_listings")
        .select("*, domains(name, tld)")
        .eq("is_active", true)
        .order("listed_at", { ascending: false });
      return (simpleData as unknown as Listing[]) ?? [];
    }

    return (data as unknown as Listing[]) ?? [];
  } catch {
    return [];
  }
}

function formatKRW(price: number): string {
  if (price >= 10000) {
    return `${Math.floor(price / 10000)}만원`;
  }
  return `${price.toLocaleString("ko-KR")}원`;
}

const faqItems = [
  {
    q: "프리미엄 도메인이란 무엇인가요?",
    a: "프리미엄 도메인은 높은 검색엔진 점수, 품질 좋은 백링크, 깨끗한 이력을 가진 도메인입니다. 새 도메인 대비 SEO에서 빠르게 성과를 낼 수 있습니다.",
  },
  {
    q: "도메인 이전은 어떻게 진행되나요?",
    a: "결제 확인 후 도메인 이전 코드를 제공해 드립니다. 보통 1~5일 내에 이전이 완료됩니다. 전 과정을 안내해 드립니다.",
  },
  {
    q: "가격 협의가 가능한가요?",
    a: "'협의 가능' 표시가 있는 도메인은 합리적인 범위 내에서 가격 협의가 가능합니다. 문의 폼을 통해 제안해 주세요.",
  },
];

export default async function MarketplacePage() {
  const listings = await getListings();

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="border-b px-4 py-16 sm:py-20">
        <div className="mx-auto max-w-5xl text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
            <ShoppingBag className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            프리미엄 도메인 구매
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            SEO 지표가 검증된 프리미엄 도메인을 합리적 가격에 만나보세요.
            <br />
            모든 도메인은 점수, 이력, 백링크를 사전 분석한 도메인 매매 플랫폼입니다.
          </p>
        </div>
      </section>

      {/* Listings */}
      <section className="px-4 py-12">
        <div className="mx-auto max-w-5xl">
          {listings.length > 0 ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {listings.map((listing) => {
                const domainName =
                  listing.domains?.name ?? `도메인 #${listing.id}`;
                // Extract metrics if available
                const metrics = Array.isArray(listing.domain_metrics)
                  ? listing.domain_metrics[0]
                  : null;

                return (
                  <Card
                    key={listing.id}
                    className="group border-border/60 transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
                  >
                    <CardContent className="p-6">
                      <div className="mb-4">
                        <h3 className="text-xl font-bold group-hover:text-primary transition-colors">
                          {domainName}
                        </h3>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {metrics?.moz_da != null && (
                            <Badge
                              variant="secondary"
                              className="rounded-md text-xs font-normal"
                            >
                              DA {metrics.moz_da}
                            </Badge>
                          )}
                          {metrics?.ahrefs_dr != null && (
                            <Badge
                              variant="secondary"
                              className="rounded-md text-xs font-normal"
                            >
                              DR {metrics.ahrefs_dr}
                            </Badge>
                          )}
                          {listing.is_negotiable && (
                            <Badge
                              variant="outline"
                              className="rounded-md text-xs font-normal border-green-500/30 text-green-600 dark:text-green-400"
                            >
                              협의 가능
                            </Badge>
                          )}
                        </div>
                      </div>

                      {listing.description && (
                        <p className="mb-4 text-sm text-muted-foreground line-clamp-2">
                          {listing.description}
                        </p>
                      )}

                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-primary">
                          {listing.asking_price >= 100
                            ? `$${listing.asking_price.toLocaleString()}`
                            : formatKRW(listing.asking_price)}
                        </span>
                        <Link
                          href={`/marketplace/inquiry?domain=${encodeURIComponent(domainName)}&listing=${listing.id}`}
                        >
                          <Button size="sm" className="min-h-[44px]">문의하기</Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card className="border-border/60 border-dashed">
              <CardContent className="py-16 text-center">
                <ShoppingBag className="mx-auto h-8 w-8 text-muted-foreground/50 mb-3" />
                <p className="text-muted-foreground">
                  현재 판매 중인 도메인이 없습니다. 곧 업데이트 예정입니다.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      {/* SEO Content + FAQ */}
      <section className="border-t bg-muted/30 px-4 py-16 sm:py-20">
        <div className="mx-auto max-w-3xl">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              왜 프리미엄 도메인인가?
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              새 도메인으로 시작하면 검색엔진 신뢰를 쌓는 데 수개월이 걸립니다.
              이미 점수가 높은 도메인은 콘텐츠를 올리는 즉시 상위 노출 가능성이
              높아집니다.
            </p>
          </div>

          <div className="space-y-4">
            {faqItems.map((faq) => (
              <details
                key={faq.q}
                className="group rounded-xl border border-border/60 bg-card transition-shadow hover:shadow-md [&_summary::-webkit-details-marker]:hidden"
              >
                <summary className="flex cursor-pointer items-center justify-between p-5">
                  <h3 className="pr-4 text-sm font-semibold">{faq.q}</h3>
                  <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
                </summary>
                <div className="border-t px-5 pb-5 pt-4">
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {faq.a}
                  </p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
