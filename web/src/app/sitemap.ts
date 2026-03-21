import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://domainchecker.co.kr";

  return [
    { url: base, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
    { url: `${base}/auctions`, lastModified: new Date(), changeFrequency: "always", priority: 0.9 },
    { url: `${base}/market-history`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/tools`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${base}/blog`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/blog/what-is-da`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/blog/how-to-choose-domain`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/blog/domain-auction-guide`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
  ];
}
