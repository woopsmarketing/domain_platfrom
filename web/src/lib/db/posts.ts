import { createServiceClient } from "@/lib/supabase";

export interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string[];
  status: string;
  published_at: string;
  created_at: string;
  updated_at: string;
  read_time: string;
  author: string;
  faqs: { q: string; a: string }[] | null;
}

/** 공개된 글 목록 (최신순) */
export async function getPublishedPosts(): Promise<Post[]> {
  const client = createServiceClient();
  const { data, error } = await client
    .from("posts")
    .select("*")
    .eq("status", "published")
    .order("published_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data ?? [];
}

/** slug로 단일 글 조회 */
export async function getPostBySlug(slug: string): Promise<Post | null> {
  const client = createServiceClient();
  const { data, error } = await client
    .from("posts")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data;
}

/** 관련 글 (같은 카테고리 우선, 현재 글 제외, 최대 3개) */
export async function getRelatedPosts(
  slug: string,
  category: string
): Promise<Pick<Post, "id" | "title" | "slug" | "excerpt" | "category" | "published_at">[]> {
  const client = createServiceClient();
  const { data } = await client
    .from("posts")
    .select("id, title, slug, excerpt, category, published_at")
    .eq("status", "published")
    .neq("slug", slug)
    .order("published_at", { ascending: false })
    .limit(10);

  const posts = data ?? [];
  const same = posts.filter((p) => p.category === category);
  const other = posts.filter((p) => p.category !== category);
  return [...same, ...other].slice(0, 3);
}

/** 최신 글 (현재 글 제외, 3개) */
export async function getLatestPosts(
  slug: string
): Promise<Pick<Post, "id" | "title" | "slug" | "excerpt" | "published_at">[]> {
  const client = createServiceClient();
  const { data } = await client
    .from("posts")
    .select("id, title, slug, excerpt, published_at")
    .eq("status", "published")
    .neq("slug", slug)
    .order("published_at", { ascending: false })
    .limit(3);

  return data ?? [];
}

/** 이전/다음 글 */
export async function getAdjacentPosts(publishedAt: string, slug: string) {
  const client = createServiceClient();

  const [prevRes, nextRes] = await Promise.all([
    client
      .from("posts")
      .select("title, slug")
      .eq("status", "published")
      .lt("published_at", publishedAt)
      .order("published_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    client
      .from("posts")
      .select("title, slug")
      .eq("status", "published")
      .gt("published_at", publishedAt)
      .order("published_at", { ascending: true })
      .limit(1)
      .maybeSingle(),
  ]);

  return {
    prev: prevRes.data as { title: string; slug: string } | null,
    next: nextRes.data as { title: string; slug: string } | null,
  };
}
