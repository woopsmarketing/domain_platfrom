import type { MetadataRoute } from "next";
import { getPublishedPosts } from "@/lib/db/posts";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = "https://domainchecker.co.kr";

  // 블로그 글 DB 기반 자동 생성
  const posts = await getPublishedPosts();
  const blogEntries: MetadataRoute.Sitemap = posts.map((p) => ({
    url: `${base}/blog/${p.slug}`,
    lastModified: new Date(p.updated_at || p.published_at),
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  return [
    // ── 핵심 SEO 페이지 (최우선)
    { url: base, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
    { url: `${base}/blog`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.95 },
    ...blogEntries, // priority: 0.8 (블로그 글)

    // ── 도구 (검색 의도 높음)
    { url: `${base}/tools`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.85 },
    { url: `${base}/tools/domain-availability`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.85 },
    { url: `${base}/tools/domain-generator`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.85 },
    { url: `${base}/tools/backlink-checker`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.85 },
    { url: `${base}/tools/serp-checker`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.85 },
    { url: `${base}/tools/domain-value`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/tools/whois-lookup`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/tools/dns-checker`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/tools/ssl-checker`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.75 },
    { url: `${base}/tools/domain-compare`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.75 },
    { url: `${base}/tools/bulk-analysis`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.75 },
    { url: `${base}/tools/http-status`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${base}/tools/domain-expiry`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },

    // ── 마켓플레이스 / 이력 (콘텐츠 페이지)
    { url: `${base}/marketplace`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
    { url: `${base}/market-history`, lastModified: new Date(), changeFrequency: "daily", priority: 0.75 },
    { url: `${base}/pricing`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/inquiry`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },

    // ── 실시간 경매 (동적 페이지 — SEO 가치 낮음, 우선순위 하향)
    { url: `${base}/auctions`, lastModified: new Date(), changeFrequency: "hourly", priority: 0.5 },
  ];
}
