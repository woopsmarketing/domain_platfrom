import { ArrowLeft, ExternalLink, Calendar, Server, Shield } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatPrice, formatDate } from "@/lib/utils";
import { getDomainByName } from "@/lib/db/domains";
import { fetchWhois } from "@/lib/external/whois";
import { fetchWayback } from "@/lib/external/wayback";
import type { DomainDetail } from "@/types/domain";

interface PageProps {
  params: Promise<{ name: string }>;
}

export default async function DomainDetailPage({ params }: PageProps) {
  const { name } = await params;

  let data: DomainDetail | null = null;
  try {
    const dbData = await getDomainByName(name);
    if (dbData) {
      const [whois, wayback] = await Promise.all([
        fetchWhois(name),
        dbData.wayback ? Promise.resolve(dbData.wayback) : fetchWayback(dbData.domain.id, name),
      ]);
      data = { ...dbData, whois, wayback: wayback ?? dbData.wayback };
    }
  } catch {
    // DB not connected - data stays null
  }

  if (!data) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
          <p className="text-lg font-medium">도메인을 찾을 수 없습니다</p>
          <p className="text-sm">{name} 에 대한 정보가 없습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <Link href="/">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">{name}</h1>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Badge variant={data.domain.status === "auction" ? "auction" : "outline"}>
              {data.domain.status === "auction" ? "경매 진행중" : data.domain.status}
            </Badge>
            {data.domain.currentPrice && (
              <span className="font-semibold text-foreground">
                {formatPrice(data.domain.currentPrice)}
              </span>
            )}
            <span>· {data.domain.source.toUpperCase()}</span>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* 1. Whois */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Shield className="h-4 w-4" /> Whois 정보
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {data.whois ? (
              <>
                <Row label="레지스트라" value={data.whois.registrar} />
                <Row label="등록일" value={data.whois.createdDate} />
                <Row label="만료일" value={data.whois.expiresDate} />
                <Row label="수정일" value={data.whois.updatedDate} />
                <Row label="네임서버" value={data.whois.nameServers.join(", ")} />
                <Row label="상태" value={data.whois.status.join(", ")} />
              </>
            ) : (
              <p className="text-muted-foreground">Whois 정보를 불러올 수 없습니다.</p>
            )}
          </CardContent>
        </Card>

        {/* 2. SEO Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">SEO 지수</CardTitle>
          </CardHeader>
          <CardContent>
            {data.metrics ? (
              <div className="grid grid-cols-2 gap-4">
                <MetricBlock title="Moz" items={[
                  { label: "DA", value: data.metrics.mozDA },
                  { label: "Spam Score", value: data.metrics.mozSpam },
                ]} />
                <MetricBlock title="Ahrefs" items={[
                  { label: "DR", value: data.metrics.ahrefsDR },
                  { label: "트래픽", value: data.metrics.ahrefsTraffic },
                  { label: "백링크", value: data.metrics.ahrefsBacklinks },
                  { label: "트래픽 가치", value: data.metrics.ahrefsTrafficValue, prefix: "$" },
                ]} />
                <MetricBlock title="Majestic" items={[
                  { label: "TF", value: data.metrics.majesticTF },
                  { label: "CF", value: data.metrics.majesticCF },
                ]} />
                <div className="text-xs text-muted-foreground">
                  마지막 업데이트: {formatDate(data.metrics.updatedAt)}
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">SEO 데이터 없음</p>
            )}
          </CardContent>
        </Card>

        {/* 3. Sales History */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Calendar className="h-4 w-4" /> 거래 이력
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.salesHistory.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>날짜</TableHead>
                    <TableHead>가격</TableHead>
                    <TableHead>플랫폼</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.salesHistory.map((sale) => (
                    <TableRow key={sale.id}>
                      <TableCell>{sale.soldAt}</TableCell>
                      <TableCell className="font-medium">{formatPrice(sale.priceUsd)}</TableCell>
                      <TableCell>{sale.platform}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-sm text-muted-foreground">거래 이력이 없습니다.</p>
            )}
          </CardContent>
        </Card>

        {/* 4. Wayback */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Server className="h-4 w-4" /> Wayback Machine 히스토리
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.wayback ? (
              <div className="flex flex-wrap gap-6 text-sm">
                <div>
                  <p className="text-muted-foreground">총 스냅샷</p>
                  <p className="text-xl font-bold">{data.wayback.totalSnapshots}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">첫 크롤일</p>
                  <p className="font-medium">
                    {data.wayback.firstSnapshotAt
                      ? formatDate(data.wayback.firstSnapshotAt)
                      : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">마지막 크롤일</p>
                  <p className="font-medium">
                    {data.wayback.lastSnapshotAt
                      ? formatDate(data.wayback.lastSnapshotAt)
                      : "—"}
                  </p>
                </div>
                <a
                  href={`https://web.archive.org/web/*/${name}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-primary hover:underline"
                >
                  Wayback에서 보기 <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Wayback 데이터 없음</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

function MetricBlock({
  title,
  items,
}: {
  title: string;
  items: { label: string; value: number | null; prefix?: string }[];
}) {
  return (
    <div>
      <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </p>
      {items.map((item) => (
        <div key={item.label} className="flex justify-between text-sm">
          <span className="text-muted-foreground">{item.label}</span>
          <span className="font-medium tabular-nums">
            {item.value !== null ? `${item.prefix ?? ""}${item.value.toLocaleString()}` : "—"}
          </span>
        </div>
      ))}
    </div>
  );
}
