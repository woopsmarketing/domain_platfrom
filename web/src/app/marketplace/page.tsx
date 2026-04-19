import type { Metadata } from "next";
import Link from "next/link";
import { ShoppingBag, ChevronDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { createServiceClient } from "@/lib/supabase";
import { Suspense } from "react";
import ListingCard, {
  type ListingCardData,
} from "@/components/marketplace/listing-card";
import ListingFilters from "@/components/marketplace/listing-filters";

export const revalidate = 120;

export const metadata: Metadata = {
  title: "프리미엄 도메인 구매 · 검증된 도메인 판매 · 도메인 매매 | 도메인체커",
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
    title: "프리미엄 도메인 구매 · 검증된 도메인 매매 | 도메인체커",
    description:
      "SEO 지표가 검증된 프리미엄 도메인을 합리적 가격에 구매하세요.",
    type: "website",
    siteName: "도메인체커",
  },
};

interface SearchParams {
  tld?: string;
  min_price?: string;
  max_price?: string;
  sort?: string;
}

async function getListings(params: SearchParams): Promise<ListingCardData[]> {
  try {
    const client = createServiceClient();

    // Step 1: marketplace_listings + domains 조인 (domain_metrics 제외 — 직접 FK 없음)
    let query = client
      .from("marketplace_listings")
      .select(
        `
        id,
        domain_id,
        asking_price,
        description,
        is_negotiable,
        is_active,
        listed_at,
        niche,
        domain_age_years,
        pa,
        rd,
        registrant,
        view_count,
        domains(name, tld)
      `
      )
      .eq("is_active", true);

    // 가격 필터
    if (params.min_price) {
      query = query.gte("asking_price", Number(params.min_price));
    }
    if (params.max_price) {
      query = query.lte("asking_price", Number(params.max_price));
    }

    // 정렬
    switch (params.sort) {
      case "price_asc":
        query = query.order("asking_price", { ascending: true });
        break;
      case "price_desc":
        query = query.order("asking_price", { ascending: false });
        break;
      case "age_desc":
        query = query.order("domain_age_years", {
          ascending: false,
          nullsFirst: false,
        });
        break;
      case "latest":
        query = query.order("listed_at", { ascending: false });
        break;
      default:
        query = query.order("asking_price", { ascending: false });
    }

    const { data, error } = await query;

    if (error || !data) return [];

    type RawListing = {
      id: string;
      domain_id: string;
      asking_price: number;
      description: string | null;
      is_negotiable: boolean;
      is_active: boolean;
      listed_at: string;
      niche: string | null;
      domain_age_years: number | null;
      pa: number | null;
      rd: number | null;
      registrant: string | null;
      view_count: number | null;
      domains: { name: string; tld: string } | { name: string; tld: string }[] | null;
    };

    let rawListings = data as unknown as RawListing[];

    // domains가 배열로 올 경우 첫 번째 항목으로 정규화
    rawListings = rawListings.map((l) => ({
      ...l,
      domains: Array.isArray(l.domains) ? (l.domains[0] ?? null) : l.domains,
    }));

    // TLD 필터 — 서버 사이드 클라이언트 필터링 (관계 필터 미작동 회피)
    if (params.tld && params.tld !== "other") {
      rawListings = rawListings.filter(
        (l) => l.domains && !Array.isArray(l.domains) && l.domains.tld === params.tld
      );
    } else if (params.tld === "other") {
      const knownTlds = ["com", "net", "org"];
      rawListings = rawListings.filter(
        (l) => l.domains && !Array.isArray(l.domains) && !knownTlds.includes(l.domains.tld)
      );
    }

    // Step 2: domain_ids 수집 → domain_metrics 일괄 조회
    const domainIds = rawListings.map((l) => l.domain_id).filter(Boolean);
    let metricsMap: Record<string, ListingCardData["domain_metrics"]> = {};

    if (domainIds.length > 0) {
      const { data: metricsRows } = await client
        .from("domain_metrics")
        .select("domain_id, moz_da, moz_pa, ahrefs_dr, ahrefs_ref_domains")
        .in("domain_id", domainIds);

      if (metricsRows) {
        for (const m of metricsRows) {
          metricsMap[m.domain_id] = {
            moz_da: m.moz_da ?? null,
            moz_pa: m.moz_pa ?? null,
            ahrefs_dr: m.ahrefs_dr ?? null,
            ahrefs_ref_domains: m.ahrefs_ref_domains ?? null,
          };
        }
      }
    }

    // Step 3: listings에 domain_metrics 병합
    const result: ListingCardData[] = rawListings.map((l) => ({
      id: l.id,
      domain_id: l.domain_id,
      asking_price: l.asking_price,
      description: l.description,
      is_negotiable: l.is_negotiable,
      is_active: l.is_active,
      listed_at: l.listed_at,
      niche: l.niche,
      domain_age_years: l.domain_age_years,
      pa: l.pa,
      rd: l.rd,
      registrant: l.registrant,
      view_count: l.view_count ?? undefined,
      domains: (Array.isArray(l.domains) ? null : l.domains),
      domain_metrics: metricsMap[l.domain_id] ?? null,
    }));

    return result;
  } catch {
    return [];
  }
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

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqItems.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: { "@type": "Answer", text: item.a },
  })),
};

interface MarketplacePageProps {
  searchParams: Promise<SearchParams>;
}

export default async function MarketplacePage({
  searchParams,
}: MarketplacePageProps) {
  const params = await searchParams;
  const listings = await getListings(params);

  const currentTld = params.tld ?? "";
  const currentSort = params.sort ?? "";
  const currentPrice = (() => {
    const min = params.min_price ?? "";
    const max = params.max_price ?? "";
    if (!min && !max) return "";
    return `${min}-${max}`;
  })();

  return (
    <div className="flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "홈", item: "https://domainchecker.co.kr" },
              { "@type": "ListItem", position: 2, name: "프리미엄 도메인", item: "https://domainchecker.co.kr/marketplace" },
            ],
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

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
      <section className="px-4 py-10 sm:py-12">
        <div className="mx-auto max-w-5xl">
          {/* 필터 — useSearchParams 사용으로 Suspense 필요 */}
          <Suspense fallback={<div className="mb-8 h-40 animate-pulse rounded-xl bg-muted" />}>
            <ListingFilters
              currentTld={currentTld}
              currentPrice={currentPrice}
              currentSort={currentSort}
              totalCount={listings.length}
            />
          </Suspense>

          {listings.length > 0 ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {listings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          ) : (
            <Card className="border-border/60 border-dashed">
              <CardContent className="py-16 text-center">
                <ShoppingBag className="mx-auto mb-3 h-8 w-8 text-muted-foreground/50" />
                <p className="text-muted-foreground">
                  {currentTld || currentPrice
                    ? "해당 조건의 도메인이 없습니다. 필터를 변경해 보세요."
                    : "현재 판매 중인 도메인이 없습니다. 곧 업데이트 예정입니다."}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      {/* SEO Content: 프리미엄 도메인 설명 */}
      <section className="border-t px-4 py-12 sm:py-16">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-4 text-2xl font-bold">프리미엄 도메인이란?</h2>
          <div className="space-y-4 leading-relaxed text-muted-foreground">
            <p>
              프리미엄 도메인은 검색엔진에서 이미 높은 신뢰도를 확보한 도메인입니다.
              DA(Domain Authority), DR(Domain Rating) 등 SEO 지표가 검증되어 있어
              새 도메인 대비 검색 상위 노출까지 걸리는 시간을 크게 단축할 수 있습니다.
            </p>

            <h3 className="mt-6 text-lg font-semibold text-foreground">도메인 매매 시 확인할 점</h3>
            <ul className="list-disc space-y-1 pl-6">
              <li><strong>도메인 점수(DA/DR)</strong> — 검색엔진이 부여한 권위도를 확인하세요</li>
              <li><strong>스팸 점수</strong> — 과거 스팸 이력이 있으면 페널티 위험이 있습니다</li>
              <li><strong>백링크 품질</strong> — 양질의 참조 도메인에서 오는 링크인지 확인하세요</li>
              <li><strong>Wayback 이력</strong> — 과거에 어떤 콘텐츠가 있었는지 반드시 조회하세요</li>
            </ul>

            <p className="mt-4">
              도메인체커에서 관심 도메인을 무료로 분석하면 이 모든 지표를 한눈에 확인할 수 있습니다.
              데이터 기반으로 도메인 판매 가격의 적정성을 직접 판단해 보세요.
            </p>

            <div className="mt-6 flex flex-wrap gap-4 text-sm">
              <Link href="/tools/domain-value" className="text-primary hover:underline">
                도메인 가치 평가 →
              </Link>
              <Link href="/blog/how-to-choose-domain" className="text-primary hover:underline">
                도메인 고르는 법 →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t bg-muted/30 px-4 py-16 sm:py-20">
        <div className="mx-auto max-w-3xl">
          <div className="mb-12 text-center">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              자주 묻는 질문
            </h2>
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
