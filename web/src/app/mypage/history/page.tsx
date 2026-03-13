import { Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function HistoryPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" /> 구매 이력
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <Clock className="mb-3 h-10 w-10 opacity-30" />
          <p>구매 이력이 없습니다.</p>
        </div>
      </CardContent>
    </Card>
  );
}
