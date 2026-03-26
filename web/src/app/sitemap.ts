import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://domainchecker.co.kr";

  return [
    // 메인
    { url: base, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
    { url: `${base}/auctions`, lastModified: new Date(), changeFrequency: "always", priority: 0.9 },
    { url: `${base}/market-history`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
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
    { url: `${base}/tools/domain-expiry`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },

    // 블로그
    { url: `${base}/blog`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/blog/domain-spam-score-check`, lastModified: new Date("2026-03-26"), changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/blog/domain-auction-guide`, lastModified: new Date("2026-03-20"), changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/blog/how-to-choose-domain`, lastModified: new Date("2026-03-15"), changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/blog/what-is-da`, lastModified: new Date("2026-03-10"), changeFrequency: "monthly", priority: 0.7 },
  ];
}
