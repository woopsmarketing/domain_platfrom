import { ImageResponse } from "next/og";
import { getPostBySlug } from "@/lib/db/posts";

export const runtime = "edge";
export const alt = "도메인체커 블로그";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const CATEGORY_BADGE_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  "SEO 분석": { bg: "rgba(59, 130, 246, 0.15)", border: "rgba(59, 130, 246, 0.3)", text: "#60a5fa" },
  "도메인 투자": { bg: "rgba(16, 185, 129, 0.15)", border: "rgba(16, 185, 129, 0.3)", text: "#34d399" },
  "SEO 기초": { bg: "rgba(139, 92, 246, 0.15)", border: "rgba(139, 92, 246, 0.3)", text: "#a78bfa" },
};

export default async function OgImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  const title = post?.title ?? "블로그";
  const category = post?.category ?? "";
  const readTime = post?.read_time ?? "";
  const colors = CATEGORY_BADGE_COLORS[category] ?? CATEGORY_BADGE_COLORS["SEO 기초"];

  // 제목이 너무 길면 줄이기
  const displayTitle = title.length > 40 ? title.slice(0, 38) + "..." : title;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "60px 80px",
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

        {/* Top section: category + read time */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {category && (
            <div
              style={{
                padding: "8px 20px",
                borderRadius: 100,
                background: colors.bg,
                border: `1px solid ${colors.border}`,
                color: colors.text,
                fontSize: 20,
                fontWeight: 600,
              }}
            >
              {category}
            </div>
          )}
          {readTime && (
            <div style={{ color: "#64748b", fontSize: 20 }}>
              {readTime} 읽기
            </div>
          )}
        </div>

        {/* Middle: Title */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 20,
            flex: 1,
            justifyContent: "center",
          }}
        >
          <div
            style={{
              fontSize: 52,
              fontWeight: 800,
              color: "white",
              letterSpacing: -1,
              lineHeight: 1.3,
              wordBreak: "keep-all",
            }}
          >
            {displayTitle}
          </div>
        </div>

        {/* Bottom: branding */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            {/* Logo */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 48,
                height: 48,
                borderRadius: 12,
                background: "rgba(59, 130, 246, 0.15)",
              }}
            >
              <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
                <circle cx="13" cy="13" r="10" stroke="#3b82f6" strokeWidth="2.5" />
                <line x1="20.5" y1="20.5" x2="29" y2="29" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, color: "white" }}>
              도메인체커
            </div>
          </div>
          <div style={{ fontSize: 18, color: "#64748b" }}>
            domainchecker.co.kr
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
