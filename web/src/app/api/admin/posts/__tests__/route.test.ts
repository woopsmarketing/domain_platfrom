import { describe, it, expect, vi, beforeEach } from "vitest";
import type { NextRequest } from "next/server";

// ──────────────────────────────────────────
// 목적: 블로그 발행 알림 회귀 테스트.
//  - 일반 블로그 글 발행 경로에서 Google Indexing API 호출이 없어야 한다.
//  - IndexNow 알림과 cache revalidation은 유지되어야 한다.
//  - draft 저장/수정은 외부 검색엔진 알림을 발생시키지 않아야 한다.
//  route 핸들러는 이미 export 되어 있어 리팩터링 없이 모듈 경계만 mock 한다.
//  (@/lib/api-helpers, next/cache, 전역 fetch)
// ──────────────────────────────────────────

// vi.mock 팩토리는 hoist 되므로 참조 값은 vi.hoisted 로 끌어올린다.
const h = vi.hoisted(() => {
  const revalidatePath = vi.fn();
  const revalidateTag = vi.fn();
  const fetchMock = vi.fn();

  // Supabase service client 대역: 체이닝 + 직접 await 모두 지원.
  const db = {
    result: { data: null as unknown, error: null as unknown },
    calls: {
      from: [] as string[],
      insert: [] as unknown[],
      update: [] as unknown[],
      deletes: 0,
    },
  };

  const makeBuilder = () => {
    const b: Record<string, unknown> = {};
    const self = () => b;
    b.from = (t: string) => {
      db.calls.from.push(t);
      return b;
    };
    b.insert = (v: unknown) => {
      db.calls.insert.push(v);
      return b;
    };
    b.update = (v: unknown) => {
      db.calls.update.push(v);
      return b;
    };
    b.delete = () => {
      db.calls.deletes += 1;
      return b;
    };
    b.select = self;
    b.eq = self;
    b.order = self;
    b.maybeSingle = async () => db.result;
    // `await client.from(...).delete().eq(...)` 및 `.order(...)` 대응(thenable).
    b.then = (resolve: (v: unknown) => void) => resolve(db.result);
    return b;
  };

  return { revalidatePath, revalidateTag, fetchMock, db, makeBuilder };
});

vi.mock("next/cache", () => ({
  revalidatePath: h.revalidatePath,
  revalidateTag: h.revalidateTag,
}));

vi.mock("@/lib/api-helpers", () => ({
  requireAdmin: () => Promise.resolve({ user: { id: "admin" }, error: null }),
  getServiceClient: () => h.makeBuilder(),
}));

vi.stubGlobal("fetch", h.fetchMock);

// mock 설정 후 대상 route import.
import { POST, PATCH, DELETE } from "@/app/api/admin/posts/route";

// ──────────────────────────────────────────
// 헬퍼
// ──────────────────────────────────────────
const makeReq = (body: unknown): NextRequest =>
  ({ json: async () => body } as unknown as NextRequest);

const fetchedUrls = (): string[] =>
  h.fetchMock.mock.calls.map((c) => String(c[0]));
const hitIndexNow = (): boolean =>
  fetchedUrls().some((u) => u.includes("/api/indexnow"));
const hitGoogle = (): boolean =>
  fetchedUrls().some((u) => u.includes("/api/google-indexing"));

beforeEach(() => {
  h.fetchMock.mockReset();
  h.fetchMock.mockResolvedValue({ ok: true, json: async () => ({}) });
  h.revalidatePath.mockReset();
  h.revalidateTag.mockReset();
  h.db.result = { data: null, error: null };
  h.db.calls.from.length = 0;
  h.db.calls.insert.length = 0;
  h.db.calls.update.length = 0;
  h.db.calls.deletes = 0;
  // 실제 credential 미사용 — 테스트용 가짜 값만 주입.
  process.env.SUPABASE_SERVICE_ROLE_KEY = "test-service-role-key";
  process.env.NEXT_PUBLIC_SITE_URL = "https://example.test";
});

// ──────────────────────────────────────────
// Draft
// ──────────────────────────────────────────
describe("admin posts route — draft 저장", () => {
  it("신규 draft 저장 시 posts insert 는 수행하되 IndexNow 미호출", async () => {
    h.db.result = { data: { id: "1", slug: "draft-post" }, error: null };
    const res = await POST(
      makeReq({ title: "t", slug: "draft-post", status: "draft" })
    );
    expect(res.status).toBe(201);
    expect(h.db.calls.insert).toHaveLength(1);
    expect(hitIndexNow()).toBe(false);
  });

  it("신규 draft 저장 시 Google Indexing API 미호출", async () => {
    h.db.result = { data: { id: "1", slug: "draft-post" }, error: null };
    await POST(makeReq({ title: "t", slug: "draft-post", status: "draft" }));
    expect(hitGoogle()).toBe(false);
    expect(h.fetchMock).not.toHaveBeenCalled();
  });

  it("draft 수정 시 외부 검색엔진 알림 없음(revalidation 만)", async () => {
    h.db.result = { data: { slug: "draft-post" }, error: null };
    await PATCH(makeReq({ id: "1", status: "draft", content: "updated" }));
    expect(hitIndexNow()).toBe(false);
    expect(hitGoogle()).toBe(false);
    expect(h.revalidatePath).toHaveBeenCalled();
  });
});

// ──────────────────────────────────────────
// Published
// ──────────────────────────────────────────
describe("admin posts route — published", () => {
  it("신규 published 저장 시 IndexNow 호출", async () => {
    h.db.result = { data: { id: "1", slug: "pub-post" }, error: null };
    const res = await POST(
      makeReq({ title: "t", slug: "pub-post", status: "published" })
    );
    expect(res.status).toBe(201);
    expect(h.db.calls.insert).toHaveLength(1);
    expect(hitIndexNow()).toBe(true);
  });

  it("신규 published 저장 시 Google Indexing API 미호출", async () => {
    h.db.result = { data: { id: "1", slug: "pub-post" }, error: null };
    await POST(makeReq({ title: "t", slug: "pub-post", status: "published" }));
    expect(hitGoogle()).toBe(false);
  });

  it("draft → published 전환 시 IndexNow 호출", async () => {
    h.db.result = { data: { slug: "pub-post" }, error: null };
    await PATCH(makeReq({ id: "1", status: "published" }));
    expect(hitIndexNow()).toBe(true);
  });

  it("draft → published 전환 시 Google Indexing API 미호출", async () => {
    h.db.result = { data: { slug: "pub-post" }, error: null };
    await PATCH(makeReq({ id: "1", status: "published" }));
    expect(hitGoogle()).toBe(false);
  });

  it("published 저장 시 cache revalidation 유지", async () => {
    h.db.result = { data: { id: "1", slug: "pub-post" }, error: null };
    await POST(makeReq({ title: "t", slug: "pub-post", status: "published" }));
    expect(h.revalidatePath).toHaveBeenCalledWith("/blog", "page");
  });
});

// ──────────────────────────────────────────
// Existing Published Edit (현재 계약 그대로 검증)
// ──────────────────────────────────────────
describe("admin posts route — 기존 published 본문 수정", () => {
  it("status 미포함 본문 수정은 revalidation 만 발생(외부 알림 없음)", async () => {
    h.db.result = { data: { slug: "pub-post" }, error: null };
    await PATCH(makeReq({ id: "1", content: "본문만 수정" }));
    expect(h.revalidatePath).toHaveBeenCalled();
    expect(hitIndexNow()).toBe(false);
    expect(hitGoogle()).toBe(false);
    expect(h.fetchMock).not.toHaveBeenCalled();
  });
});

// ──────────────────────────────────────────
// Delete (현재 동작 그대로 검증 — 삭제 알림 기능 신설하지 않음)
// ──────────────────────────────────────────
describe("admin posts route — 삭제", () => {
  it("삭제 시 revalidation 발생, Google/IndexNow 알림 없음", async () => {
    h.db.result = { data: { slug: "pub-post" }, error: null };
    await DELETE(makeReq({ id: "1" }));
    expect(h.revalidatePath).toHaveBeenCalled();
    expect(hitGoogle()).toBe(false);
    expect(hitIndexNow()).toBe(false);
    expect(h.fetchMock).not.toHaveBeenCalled();
  });
});
