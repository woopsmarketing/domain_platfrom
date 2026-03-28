import type { MetadataRoute } from "next";
import { articles } from "@/lib/blog";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://domainchecker.co.kr";

  // 블로그 글 자동 생성 — lib/blog.ts에 추가하면 자동 등록
  const blogEntries: MetadataRoute.Sitemap = articles.map((article) => ({
    url: `${base}/blog/${article.slug}`,
    lastModified: new Date(article.date),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [
    // 메인
    { url: base, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
    { url: `${base}/auctions`, lastModified: new Date(), changeFrequency: "always", priority: 0.9 },
    { url: `${base}/market-history`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/marketplace`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
    { url: `${base}/inquiry`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/pricing`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },

    // 도구
    { url: `${base}/tools`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/tools/domain-availability`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/tools/domain-generator`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/tools/dns-checker`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${base}/tools/whois-lookup`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${base}/tools/ssl-checker`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${base}/tools/http-status`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${base}/tools/domain-value`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${base}/tools/domain-compare`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${base}/tools/bulk-analysis`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${base}/tools/backlink-checker`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/tools/serp-checker`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/tools/domain-expiry`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },

    // 블로그 (자동)
    { url: `${base}/blog`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    ...blogEntries,
  ];
}
