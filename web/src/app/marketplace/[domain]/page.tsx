import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  BarChart2,
  Globe,
  Link2,
  ExternalLink,
  Calendar,
  Tag,
  User,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createServiceClient } from "@/lib/supabase";
import { PurchaseRequestForm } from "@/components/marketplace/purchase-request-form";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ domain: string }>;
}

// ---------------------------------------------------------------------------
// 타입
// ---------------------------------------------------------------------------

interface ListingDetail {
  id: string;
  domain_id: string;
  asking_price: number;
  description: string | null;
  is_negotiable: boolean;
  is_active: boolean;
  niche: string | null;
  domain_age_years: number | null;
  registrant: string | null;
  backlinks_from: string | null;
  pa: number | null;
  rd: number | null;
  listed_at: string;
  domains: {
    name: string;
    tld: string;
  } | null;
  domain_metrics: {
    moz_da: number | null;
    moz_pa: number | null;
    ahrefs_backlinks: number | null;
    ahrefs_ref_domains: number | null;
    ahrefs_dr: number | null;
  } | null;
}

// ---------------------------------------------------------------------------
// 데이터 로딩
// ---------------------------------------------------------------------------

async function getListing(domainName: string): Promise<ListingDetail | null> {
  try {
    const client = createServiceClient();

    // marketplace_listings → domains → domain_metrics (JOIN)
    const { data, error } = await client
      .from("marketplace_listings")
      .select(
        `
        id,
        domain_id,
        asking_price,
        description,
        is_negotiable,
        is_active,
        niche,
        domain_age_years,
        registrant,
        backlinks_from,
        pa,
        rd,
        listed_at,
        domains!inner (
          name,
          tld
        )
      `
      )
      .eq("domains.name", domainName)
      .eq("is_active", true)
      .maybeSingle();

    if (error || !data) return null;

    // domain_metrics 별도 조회 (cost_price_usd 절대 select 하지 않음)
    const { data: metrics } = await client
      .from("domain_metrics")
      .select(
        "moz_da, moz_pa, ahrefs_backlinks, ahrefs_ref_domains, ahrefs_dr"
      )
      .eq("domain_id", data.domain_id)
      .maybeSingle();

    return {
      ...(data as unknown as Omit<ListingDetail, "domain_metrics">),
      domain_metrics: metrics ?? null,
    };
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// 메타데이터
// ---------------------------------------------------------------------------

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { domain: domainParam } = await params;
  const domainName = decodeURIComponent(domainParam).toLowerCase();

  const listing = await getListing(domainName);
  if (!listing) {
    return { title: "도메인을 찾을 수 없습니다 | 도메인체커" };
  }

  const da = listing.domain_metrics?.moz_da ?? null;
  const age = listing.domain_age_years;

  const descParts: string[] = [];
  if (da !== null) descParts.push(`DA ${da}`);
  if (age) descParts.push(`${age}년 이력`);

  const description =
    descParts.length > 0
      ? `${domainName} 도메인을 합리적 가격에 구매하세요. ${descParts.join(", ")}의 검증된 프리미엄 도메인.`
      : `${domainName} 도메인을 합리적 가격에 구매하세요. SEO 지표가 검증된 프리미엄 도메인입니다.`;

  return {
    title: `${domainName} 구매 · 프리미엄 도메인 | 도메인체커`,
    description,
    robots: { index: false, follow: false },
  };
}

// ---------------------------------------------------------------------------
// 통계 카드
// ---------------------------------------------------------------------------

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number | null;
  unit?: string;
}

function StatCard({ icon, label, value }: StatCardProps) {
  return (
    <Card className="border-border/60">
      <CardContent className="flex flex-col items-center justify-center gap-2 p-5 text-center">
        <div className="text-muted-foreground">{icon}</div>
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <p className="text-2xl font-bold tabular-nums">
          {value !== null ? value.toLocaleString() : "—"}
        </p>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// 페이지
// ---------------------------------------------------------------------------

export default async function MarketplaceDetailPage({ params }: PageProps) {
  const { domain: domainParam } = await params;
  const domainName = decodeURIComponent(domainParam).toLowerCase();

  const listing = await getListing(domainName);

  if (!listing || !listing.is_active) {
    notFound();
  }

  const metrics = listing.domain_metrics;
  const da = metrics?.moz_da ?? null;
  const pa = listing.pa ?? metrics?.moz_pa ?? null;
  const rd = listing.rd ?? metrics?.ahrefs_ref_domains ?? null;
  const backlinks = metrics?.ahrefs_backlinks ?? listing.rd ?? null;

  // KRW 환산 (1 USD = 1,300 KRW)
  const krw = Math.round(listing.asking_price * 1300);
  const krwFormatted =
    krw >= 10000
      ? `${Math.floor(krw / 10000).toLocaleString()}만원`
      : krw.toLocaleString("ko-KR") + "원";

  // 백링크 출처 파싱 (콤마 구분 문자열 → 배열)
  const backlinksFromArr: string[] = listing.backlinks_from
    ? listing.backlinks_from
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:py-14">
      {/* 뒤로 가기 */}
      <Link
        href="/marketplace"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        프리미엄 도메인 목록
      </Link>

      {/* 도메인 헤더 */}
      <div className="mb-8">
        <div className="flex flex-wrap items-start gap-3">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {listing.domains?.name ?? domainName}
          </h1>
          {listing.is_negotiable && (
            <Badge
              variant="outline"
              className="mt-1 border-green-500/40 text-green-600 dark:text-green-400"
            >
              협의 가능
            </Badge>
          )}
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
          {listing.niche && (
            <span className="flex items-center gap-1.5">
              <Tag className="h-3.5 w-3.5" />
              {listing.niche}
            </span>
          )}
          {listing.domain_age_years && (
            <span className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              {listing.domain_age_years}년 이력
            </span>
          )}
          {listing.registrant && (
            <span className="flex items-center gap-1.5">
              <User className="h-3.5 w-3.5" />
              {listing.registrant}
            </span>
          )}
        </div>

        {listing.description && (
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground max-w-2xl">
            {listing.description}
          </p>
        )}
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        {/* 왼쪽: 통계 + 백링크 출처 + 상세 분석 링크 */}
        <div className="space-y-8">
          {/* 통계 카드 4개 */}
          <div>
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              SEO 지표
            </h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatCard
                icon={<BarChart2 className="h-5 w-5" />}
                label="DA"
                value={da}
              />
              <StatCard
                icon={<Globe className="h-5 w-5" />}
                label="PA"
                value={pa}
              />
              <StatCard
                icon={<Link2 className="h-5 w-5" />}
                label="참조 도메인"
                value={rd}
              />
              <StatCard
                icon={<ExternalLink className="h-5 w-5" />}
                label="백링크"
                value={backlinks}
              />
            </div>
          </div>

          {/* 주요 백링크 출처 */}
          {backlinksFromArr.length > 0 && (
            <div>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                주요 백링크 출처
              </h2>
              <div className="flex flex-wrap gap-2">
                {backlinksFromArr.map((site) => (
                  <Badge
                    key={site}
                    variant="secondary"
                    className="rounded-md text-xs font-normal"
                  >
                    {site}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* 상세 분석 링크 */}
          <div className="rounded-xl border border-border/60 bg-muted/30 px-5 py-4">
            <p className="text-sm text-muted-foreground">
              이 도메인의 Whois, Wayback, 거래 이력 등 전체 분석 데이터를
              확인하고 싶으신가요?
            </p>
            <Link
              href={`/domain/${listing.domains?.name ?? domainName}`}
              className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
            >
              이 도메인 상세 분석 보기
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {/* 오른쪽: 가격 + 구매 신청 폼 */}
        <div className="space-y-4">
          {/* 가격 카드 */}
          <Card className="border-border/60 bg-primary/5">
            <CardContent className="px-6 py-5">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                판매가
              </p>
              <p className="mt-1 text-3xl font-bold text-primary">
                ${listing.asking_price.toLocaleString()}
              </p>
              <p className="mt-0.5 text-sm text-muted-foreground">
                약 {krwFormatted}
              </p>
            </CardContent>
          </Card>

          {/* 구매 신청 폼 */}
          <PurchaseRequestForm
            listingId={listing.id}
            domainName={listing.domains?.name ?? domainName}
            askingPrice={listing.asking_price}
          />

          {/* 안내 텍스트 */}
          <div className="rounded-xl border border-border/40 px-4 py-3 text-xs text-muted-foreground leading-relaxed space-y-1">
            <p className="font-medium text-foreground text-sm">
              구매 절차 안내
            </p>
            <ul className="space-y-1 pl-1">
              <li>· 신청 접수 후 가용 여부를 1영업일 내 확인드립니다</li>
              <li>· 확인 후 입금 안내 및 이전 절차를 안내드립니다</li>
              <li>· 도메인 이전은 일반적으로 1~5일 소요됩니다</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
