import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/domain/", "/auctions", "/market-history", "/tools", "/blog/"],
        disallow: [
          "/api/",           // API 엔드포인트
          "/_next/",         // Next.js 내부 빌드 파일
          "/api/submissions/", // 브라우저 확장 더미 라우트
        ],
      },
      {
        userAgent: "Googlebot",
        allow: ["/", "/domain/", "/auctions", "/market-history", "/tools", "/blog/"],
        disallow: ["/api/", "/_next/"],
      },
      {
        userAgent: "Yeti",
        allow: ["/", "/domain/", "/auctions", "/market-history", "/tools", "/blog/"],
        disallow: ["/api/", "/_next/"],
      },
    ],
    sitemap: "https://domainchecker.co.kr/sitemap.xml",
    host: "https://domainchecker.co.kr",
  };
}
