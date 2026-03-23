import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/auctions", "/market-history", "/tools", "/tools/domain-availability", "/tools/domain-generator", "/blog/"],
        disallow: [
          "/domain/",          // 도메인 분석 페이지 색인 차단
          "/api/",             // API 엔드포인트
          "/_next/",           // Next.js 내부 빌드 파일
        ],
      },
    ],
    sitemap: "https://domainchecker.co.kr/sitemap.xml",
    host: "https://domainchecker.co.kr",
  };
}
