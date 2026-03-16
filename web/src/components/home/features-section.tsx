import { BarChart3, Shield, Zap } from "lucide-react";

const features = [
  { icon: BarChart3, title: "SEO 지표 분석", desc: "DA, DR, TF, CF 백링크, 트래픽을 한눈에" },
  { icon: Shield, title: "스팸 점수 경고", desc: "위험 도메인을 사전에 식별하여 안전한 투자" },
  { icon: Zap, title: "즉시 분석 결과", desc: "검색 즉시 7일 캐시 기반 빠른 응답" },
];

export function FeaturesSection() {
  return (
    <section className="border-b px-4 py-16">
      <div className="mx-auto grid max-w-5xl gap-6 sm:grid-cols-3">
        {features.map((f) => (
          <div key={f.title} className="flex items-start gap-4 rounded-xl border border-border/60 bg-card p-6">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <f.icon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">{f.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
