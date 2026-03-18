import { Globe, DollarSign, TrendingUp, Database } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const stats = [
  { label: "총 낙찰 기록", value: "156K", icon: Database, color: "text-blue-600" },
  { label: "평균 낙찰가", value: "$1,240", icon: DollarSign, color: "text-green-600" },
  { label: "오늘 신규 수집", value: "+324", icon: TrendingUp, color: "text-orange-600" },
  { label: "수집 플랫폼", value: "2개", icon: Globe, color: "text-purple-600" },
];

export function StatsOverview() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.label}>
          <CardContent className="flex items-center gap-3 p-4">
            <stat.icon className={`h-5 w-5 ${stat.color}`} />
            <div>
              <p className="text-2xl font-bold tabular-nums">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
