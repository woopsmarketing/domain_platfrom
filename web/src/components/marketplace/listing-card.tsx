import Link from "next/link";
import { ExternalLink, Clock, Globe, User } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const USD_TO_KRW = 1300;

export interface ListingCardData {
  id: string;
  domain_id: string;
  asking_price: number;
  description: string | null;
  is_negotiable: boolean;
  is_active: boolean;
  listed_at: string;
  niche: string | null;
  domain_age_years: number | null;
  // listing 자체 컬럼
  pa: number | null;
  rd: number | null;
  registrant: string | null;
  view_count?: number;
  domains: {
    name: string;
    tld: string;
  } | null;
  // domain_metrics 배치 조회 결과 (없을 수 있음)
  domain_metrics: {
    moz_da: number | null;
    moz_pa: number | null;
    ahrefs_dr: number | null;
    ahrefs_ref_domains: number | null;
  } | null;
}

interface ListingCardProps {
  listing: ListingCardData;
}

function formatKRW(usd: number): string {
  const krw = usd * USD_TO_KRW;
  if (krw >= 10000000) {
    return `${(krw / 10000000).toFixed(1)}천만원`;
  }
  if (krw >= 10000) {
    return `${Math.floor(krw / 10000).toLocaleString("ko-KR")}만원`;
  }
  return `${krw.toLocaleString("ko-KR")}원`;
}

function getDaColor(da: number): string {
  if (da >= 50) return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400";
  if (da >= 30) return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
  if (da >= 15) return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400";
  return "bg-secondary text-secondary-foreground";
}

export default function ListingCard({ listing }: ListingCardProps) {
  const domainFull = listing.domains?.name ?? `도메인 #${listing.id}`;

  const metrics = listing.domain_metrics ?? null;
  const da = metrics?.moz_da ?? null;
  // listing 자체 pa/rd 우선, 없으면 domain_metrics fallback
  const pa = listing.pa ?? metrics?.moz_pa ?? null;
  const dr = metrics?.ahrefs_dr ?? null;
  const rd = listing.rd ?? metrics?.ahrefs_ref_domains ?? null;
  const registrant = listing.registrant ?? null;

  return (
    <Card className="group flex flex-col border-border/60 transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5">
      <CardContent className="flex flex-1 flex-col p-5">
        {/* DA 뱃지 + 인기 뱃지 + 도메인명 */}
        <div className="mb-3">
          <div className="mb-2 flex flex-wrap items-center gap-1.5">
            {da != null && (
              <span
                className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold ${getDaColor(da)}`}
              >
                DA {da}
              </span>
            )}
            {(listing.view_count ?? 0) >= 10 && (
              <span className="inline-flex items-center rounded-md bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700 dark:bg-red-900/30 dark:text-red-400">
                🔥 인기
              </span>
            )}
          </div>
          <h3 className="mt-1 truncate text-lg font-bold tracking-tight group-hover:text-primary transition-colors">
            {domainFull}
          </h3>
        </div>

        {/* 서브 지표 뱃지 */}
        <div className="mb-3 flex flex-wrap gap-1.5">
          {pa != null && (
            <Badge variant="secondary" className="rounded-md text-xs font-normal">
              PA {pa}
            </Badge>
          )}
          {dr != null && (
            <Badge variant="secondary" className="rounded-md text-xs font-normal">
              DR {dr}
            </Badge>
          )}
          {rd != null && (
            <Badge variant="secondary" className="rounded-md text-xs font-normal">
              RD {rd.toLocaleString()}
            </Badge>
          )}
          {listing.is_negotiable && (
            <Badge
              variant="outline"
              className="rounded-md text-xs font-normal border-green-500/40 text-green-600 dark:text-green-400"
            >
              협의 가능
            </Badge>
          )}
        </div>

        {/* Niche + Age + Registrant */}
        <div className="mb-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          {listing.niche && (
            <span className="flex items-center gap-1">
              <Globe className="h-3 w-3" />
              {listing.niche}
            </span>
          )}
          {listing.domain_age_years != null && (
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {listing.domain_age_years}년
            </span>
          )}
          {registrant && (
            <span className="flex items-center gap-1">
              <User className="h-3 w-3" />
              {registrant}
            </span>
          )}
        </div>

        {/* 설명 */}
        {listing.description && (
          <p className="mb-4 text-sm text-muted-foreground line-clamp-2 flex-1">
            {listing.description}
          </p>
        )}

        {/* 가격 + CTA */}
        <div className="mt-auto border-t border-border/40 pt-4">
          <div className="mb-3">
            {(() => {
              const referencePrice = Math.round(listing.asking_price * 1.33);
              return (
                <>
                  <p className="text-xs text-muted-foreground">
                    <span className="line-through">시장가 ${referencePrice.toLocaleString()}</span>
                  </p>
                  <div>
                    <span className="text-2xl font-bold text-primary">
                      ${listing.asking_price.toLocaleString()}
                    </span>
                    <span className="ml-2 text-xs text-muted-foreground">
                      ≈ {formatKRW(listing.asking_price)}
                    </span>
                  </div>
                </>
              );
            })()}
          </div>
          <Link
            href={`/marketplace/${encodeURIComponent(listing.domains?.name ?? listing.id)}`}
            className="block"
          >
            <Button size="sm" className="w-full gap-1.5">
              <ExternalLink className="h-3.5 w-3.5" />
              상세 보기
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
