import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, getServiceClient } from "@/lib/api-helpers";
import { revalidatePath } from "next/cache";

// GET: 모든 글 목록 (draft 포함)
export async function GET() {
  const { error: authErr } = await requireAdmin();
  if (authErr) return authErr;

  const client = getServiceClient();
  const { data } = await client
    .from("posts")
    .select("*")
    .order("created_at", { ascending: false });
  return NextResponse.json({ posts: data ?? [] });
}

// POST: 새 글 작성
export async function POST(request: NextRequest) {
  const { error: authErr } = await requireAdmin();
  if (authErr) return authErr;

  const body = await request.json();
  const { title, slug, excerpt, content, category, tags, status, read_time, faqs } =
    body;

  const client = getServiceClient();
  const { data, error } = await client
    .from("posts")
    .insert({
      title,
      slug,
      excerpt,
      content,
      category,
      tags: tags || [],
      status: status || "draft",
      published_at: status === "published" ? new Date().toISOString() : null,
      read_time: read_time || "5분",
      faqs: faqs || [],
    })
    .select()
    .maybeSingle();

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  // On-Demand Revalidation
  if (status === "published") {
    revalidatePath("/blog");
    revalidatePath(`/blog/${slug}`);
    revalidatePath("/sitemap.xml");
  }

  return NextResponse.json({ post: data }, { status: 201 });
}

// PATCH: 글 수정
export async function PATCH(request: NextRequest) {
  const { error: authErr } = await requireAdmin();
  if (authErr) return authErr;

  const body = await request.json();
  const { id, ...updates } = body;
  if (!id)
    return NextResponse.json({ error: "ID 필요" }, { status: 400 });

  const client = getServiceClient();

  if (updates.status === "published" && !updates.published_at) {
    updates.published_at = new Date().toISOString();
  }
  updates.updated_at = new Date().toISOString();

  const { data, error } = await client
    .from("posts")
    .update(updates)
    .eq("id", id)
    .select()
    .maybeSingle();
  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  // Revalidation
  revalidatePath("/blog");
  if (data?.slug) revalidatePath(`/blog/${data.slug}`);

  return NextResponse.json({ post: data });
}

// DELETE: 글 삭제
export async function DELETE(request: NextRequest) {
  const { error: authErr } = await requireAdmin();
  if (authErr) return authErr;

  const { id } = await request.json();
  const client = getServiceClient();

  const { data: post } = await client
    .from("posts")
    .select("slug")
    .eq("id", id)
    .maybeSingle();
  const { error } = await client.from("posts").delete().eq("id", id);
  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  revalidatePath("/blog");
  if (post?.slug) revalidatePath(`/blog/${post.slug}`);

  return NextResponse.json({ success: true });
}
