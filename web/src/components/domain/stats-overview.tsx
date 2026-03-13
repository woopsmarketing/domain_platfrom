import { Globe, Gavel, Clock, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const stats = [
  { label: "경매 진행중", value: "2,847", icon: Gavel, color: "text-orange-600" },
  { label: "만료 도메인", value: "12,350", icon: Clock, color: "text-red-600" },
  { label: "총 등록 도메인", value: "156K", icon: Globe, color: "text-blue-600" },
  { label: "오늘 신규", value: "+324", icon: TrendingUp, color: "text-green-600" },
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
