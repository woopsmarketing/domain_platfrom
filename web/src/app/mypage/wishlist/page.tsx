import { Heart } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function WishlistPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="h-5 w-5" /> 관심 목록
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <Heart className="mb-3 h-10 w-10 opacity-30" />
          <p>관심 등록한 도메인이 없습니다.</p>
          <p className="text-sm">도메인 목록에서 하트를 눌러 추가하세요.</p>
        </div>
      </CardContent>
    </Card>
  );
}
