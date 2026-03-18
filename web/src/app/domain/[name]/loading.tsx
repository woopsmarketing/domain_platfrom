import { Hourglass } from "lucide-react";

export default function DomainLoading() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex flex-col items-center justify-center gap-4 py-24">
        <Hourglass className="h-8 w-8 animate-pulse text-primary" />
        <p className="text-lg font-medium text-muted-foreground">도메인을 분석중입니다 . . .</p>
        <p className="text-sm text-muted-foreground">SEO 지수, Wayback 히스토리를 수집하고 있습니다.</p>
      </div>
    </div>
  );
}
