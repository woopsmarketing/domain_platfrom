import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "도메인체커 — 무료 도메인 지수 체크";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)",
          fontFamily: "sans-serif",
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

        {/* Logo icon */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 32,
          }}
        >
          <svg width="80" height="80" viewBox="0 0 32 32" fill="none">
            <circle cx="13" cy="13" r="10" stroke="#3b82f6" strokeWidth="2.5" />
            <line x1="20.5" y1="20.5" x2="29" y2="29" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: 56,
            fontWeight: 800,
            color: "white",
            letterSpacing: -1,
          }}
        >
          도메인체커
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: 24,
            color: "#94a3b8",
            marginTop: 16,
          }}
        >
          무료 도메인 DA · DR · TF 분석 도구
        </div>

        {/* Feature badges */}
        <div
          style={{
            display: "flex",
            gap: 16,
            marginTop: 40,
          }}
        >
          {["Moz DA/PA", "Ahrefs DR", "Majestic TF", "Wayback"].map((label) => (
            <div
              key={label}
              style={{
                padding: "10px 24px",
                borderRadius: 100,
                background: "rgba(59, 130, 246, 0.15)",
                border: "1px solid rgba(59, 130, 246, 0.3)",
                color: "#60a5fa",
                fontSize: 18,
                fontWeight: 600,
              }}
            >
              {label}
            </div>
          ))}
        </div>

        {/* URL */}
        <div
          style={{
            position: "absolute",
            bottom: 40,
            fontSize: 18,
            color: "#64748b",
          }}
        >
          domainchecker.co.kr
        </div>
      </div>
    ),
    { ...size }
  );
}
