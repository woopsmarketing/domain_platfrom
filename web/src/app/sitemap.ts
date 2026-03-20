import type { MetadataRoute } from "next";
import { createServiceClient } from "@/lib/supabase";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = "https://domainchecker.co.kr";

  // 정적 페이지
  const staticPages: MetadataRoute.Sitemap = [
    { url: base, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
    { url: `${base}/market-history`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/tools`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${base}/blog`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/blog/what-is-da`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/blog/how-to-choose-domain`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/blog/domain-auction-guide`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
  ];

  // 동적 도메인 페이지 (DB에서 가져오기)
  let domainPages: MetadataRoute.Sitemap = [];
  try {
    const client = createServiceClient();
    const { data } = await client
      .from("domains")
      .select("name, created_at")
      .order("created_at", { ascending: false })
      .limit(5000);

    if (data) {
      domainPages = data.map((d) => ({
        url: `${base}/domain/${d.name}`,
        lastModified: new Date(d.created_at),
        changeFrequency: "weekly" as const,
        priority: 0.6,
      }));
    }
  } catch {
    // DB 오류 시 정적 페이지만 반환
  }

  return [...staticPages, ...domainPages];
}
