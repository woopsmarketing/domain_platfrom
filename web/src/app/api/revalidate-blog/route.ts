import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

/**
 * On-demand revalidate for blog pages.
 *
 * Authentication: SUPABASE_SERVICE_ROLE_KEY in Authorization Bearer header.
 *
 * POST /api/revalidate-blog
 *   body: { slug?: string }     // omit slug → revalidate /blog list only
 *
 * GET  /api/revalidate-blog?slug=foo
 *   (convenience for curl/browser one-shot)
 */

function authorized(req: NextRequest): boolean {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) return false;
  return req.headers.get("authorization") === `Bearer ${serviceKey}`;
}

function revalidate(slug: string | null): { revalidated: string[] } {
  const paths: string[] = ["/blog"];
  if (slug) paths.push(`/blog/${slug}`);
  for (const p of paths) revalidatePath(p);
  return { revalidated: paths };
}

export async function POST(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  let slug: string | null = null;
  try {
    const body = (await req.json()) as { slug?: unknown };
    if (typeof body.slug === "string" && body.slug.length > 0) slug = body.slug;
  } catch {
    // body 없으면 리스트만 revalidate
  }
  return NextResponse.json({ ok: true, ...revalidate(slug) });
}

export async function GET(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const slug = req.nextUrl.searchParams.get("slug");
  return NextResponse.json({ ok: true, ...revalidate(slug) });
}
