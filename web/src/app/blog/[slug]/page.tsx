import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getPostBySlug,
  getPublishedPosts,
  getRelatedPosts,
  getLatestPosts,
  getAdjacentPosts,
} from "@/lib/db/posts";
import { BlogLayout } from "@/components/blog/blog-layout";

interface PageProps {
  params: Promise<{ slug: string }>;
}

// ISR: 1시간 캐시
export const revalidate = 3600;

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return {};

  return {
    title: `${post.title} | 도메인체커`,
    description: post.excerpt,
    keywords: post.tags,
    alternates: { canonical: `https://domainchecker.co.kr/blog/${slug}` },
    openGraph: {
      title: `${post.title} | 도메인체커`,
      description: post.excerpt,
      type: "article",
      siteName: "도메인체커",
      publishedTime: post.published_at,
      modifiedTime: post.updated_at || post.published_at,
      tags: post.tags,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
    },
  };
}

// 정적 생성할 slug 목록
export async function generateStaticParams() {
  const posts = await getPublishedPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const [relatedPosts, latestPosts, { prev, next }] = await Promise.all([
    getRelatedPosts(slug, post.category),
    getLatestPosts(slug),
    getAdjacentPosts(post.published_at, slug),
  ]);

  // FAQ: DB의 faqs 컬럼에서 가져오기 (없으면 빈 배열)
  const faqs: { q: string; a: string }[] = post.faqs ?? [];

  return (
    <BlogLayout
      post={post}
      faqs={faqs}
      relatedPosts={relatedPosts}
      latestPosts={latestPosts}
      prevPost={prev}
      nextPost={next}
    />
  );
}
