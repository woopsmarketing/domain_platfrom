import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "도메인 분석 결과 — 도메인체커";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OgImage({ params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)",
          fontFamily: "sans-serif",
          padding: 60,
        }}
      >
        {/* Top accent line */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            background: "linear-gradient(90deg, #3b82f6, #8b5cf6, #3b82f6)",
          }}
        />

        {/* Header: logo + brand */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <svg width="44" height="44" viewBox="0 0 32 32" fill="none">
            <circle cx="13" cy="13" r="10" stroke="#3b82f6" strokeWidth="2.5" />
            <line x1="20.5" y1="20.5" x2="29" y2="29" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
          <div style={{ fontSize: 24, fontWeight: 700, color: "#94a3b8" }}>
            도메인체커
          </div>
        </div>

        {/* Domain name */}
        <div
          style={{
            marginTop: 48,
            fontSize: 64,
            fontWeight: 800,
            color: "white",
            letterSpacing: -2,
            lineHeight: 1.1,
          }}
        >
          {name}
        </div>

        {/* Subtitle */}
        <div
          style={{
            marginTop: 16,
            fontSize: 28,
            color: "#64748b",
          }}
        >
          도메인 분석 결과
        </div>

        {/* Metric cards */}
        <div
          style={{
            display: "flex",
            gap: 20,
            marginTop: 48,
          }}
        >
          {[
            { label: "Moz DA", color: "#3b82f6" },
            { label: "Ahrefs DR", color: "#8b5cf6" },
            { label: "Majestic TF", color: "#10b981" },
            { label: "Wayback", color: "#f59e0b" },
          ].map((metric) => (
            <div
              key={metric.label}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                width: 160,
                height: 100,
                borderRadius: 16,
                background: "rgba(255,255,255,0.05)",
                border: `1px solid ${metric.color}40`,
              }}
            >
              <div style={{ fontSize: 14, color: metric.color, fontWeight: 600 }}>
                {metric.label}
              </div>
              <div style={{ fontSize: 32, fontWeight: 800, color: "white", marginTop: 4 }}>
                —
              </div>
            </div>
          ))}
        </div>

        {/* Footer URL */}
        <div
          style={{
            position: "absolute",
            bottom: 40,
            right: 60,
            fontSize: 18,
            color: "#475569",
          }}
        >
          domainchecker.co.kr/domain/{name}
        </div>
      </div>
    ),
    { ...size }
  );
}
