import Link from "next/link";
import { ShoppingBag, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPrice } from "@/lib/utils";
import { mockMarketplaceListings } from "@/lib/mock-data";

export default function MarketplacePage() {
  const listings = mockMarketplaceListings;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold">
            <ShoppingBag className="h-6 w-6" /> 도메인 상점
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            엄선된 프리미엄 도메인을 구매하세요.
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {listings.map((listing) => (
          <Card key={listing.id} className="flex flex-col">
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg">
                  <Link
                    href={`/domain/${listing.domain.name}`}
                    className="text-primary hover:underline"
                  >
                    {listing.domain.name}
                  </Link>
                </CardTitle>
                <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="관심 등록">
                  <Heart className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold">{formatPrice(listing.askingPrice)}</span>
                {listing.isNegotiable && (
                  <Badge variant="secondary">가격 협의 가능</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="flex-1">
              {listing.description && (
                <p className="text-sm text-muted-foreground">{listing.description}</p>
              )}
            </CardContent>
            <CardFooter className="gap-2">
              <Button className="flex-1">구매 문의</Button>
              <Button variant="outline" className="flex-1">상세 보기</Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
