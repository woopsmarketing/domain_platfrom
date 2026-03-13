import { ShoppingCart } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CartPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5" /> 장바구니
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <ShoppingCart className="mb-3 h-10 w-10 opacity-30" />
          <p>장바구니가 비어 있습니다.</p>
          <p className="text-sm">도메인 상점에서 원하는 도메인을 담아보세요.</p>
        </div>
      </CardContent>
    </Card>
  );
}
