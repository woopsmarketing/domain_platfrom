import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "도메인체커 — 무료 도메인 분석",
    short_name: "도메인체커",
    description: "도메인 DA, DR, TF, Wayback 히스토리를 무료로 분석하세요.",
    start_url: "/",
    display: "browser",
    background_color: "#ffffff",
    theme_color: "#18181b",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
