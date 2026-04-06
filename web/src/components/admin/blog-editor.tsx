"use client";

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import "@/app/blog/blog.css";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  Eye,
  Code,
  Plus,
  Trash2,
  Save,
  Send,
  Loader2,
} from "lucide-react";
import { CATEGORIES, type BlogCategory } from "@/lib/blog";
import type { Post } from "@/lib/db/posts";

// SSR 방지: CodeMirror는 클라이언트에서만 로드
const HtmlEditor = dynamic(
  () => import("./html-editor").then((m) => ({ default: m.HtmlEditor })),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[400px] items-center justify-center rounded-md border border-border bg-muted/30">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    ),
  }
);

interface BlogEditorProps {
  post?: Post;
  onSave: () => void;
  onCancel: () => void;
}

interface FaqItem {
  q: string;
  a: string;
}

export function BlogEditor({ post, onSave, onCancel }: BlogEditorProps) {
  const isEditing = !!post;

  // Metadata
  const [title, setTitle] = useState(post?.title ?? "");
  const [slug, setSlug] = useState(post?.slug ?? "");
  const [category, setCategory] = useState<BlogCategory>(
    (post?.category as BlogCategory) ?? CATEGORIES[0]
  );
  const [tags, setTags] = useState<string[]>(post?.tags ?? []);
  const [tagInput, setTagInput] = useState("");
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? "");
  const [readTime, setReadTime] = useState(post?.read_time ?? "5분");
  const [status, setStatus] = useState<"draft" | "published">(
    (post?.status as "draft" | "published") ?? "draft"
  );

  // Content
  const [content, setContent] = useState(post?.content ?? "");
  const [previewMode, setPreviewMode] = useState(false);

  // FAQs
  const [faqs, setFaqs] = useState<FaqItem[]>(post?.faqs ?? []);

  // UI state
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTagKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        const val = tagInput.trim();
        if (val && !tags.includes(val)) {
          setTags([...tags, val]);
        }
        setTagInput("");
      }
    },
    [tagInput, tags]
  );

  const removeTag = useCallback(
    (idx: number) => {
      setTags(tags.filter((_, i) => i !== idx));
    },
    [tags]
  );

  const addFaq = useCallback(() => {
    setFaqs([...faqs, { q: "", a: "" }]);
  }, [faqs]);

  const updateFaq = useCallback(
    (idx: number, field: "q" | "a", value: string) => {
      const updated = [...faqs];
      updated[idx] = { ...updated[idx], [field]: value };
      setFaqs(updated);
    },
    [faqs]
  );

  const removeFaq = useCallback(
    (idx: number) => {
      setFaqs(faqs.filter((_, i) => i !== idx));
    },
    [faqs]
  );

  const handleSave = useCallback(
    async (saveStatus: "draft" | "published") => {
      if (!title.trim() || !slug.trim()) {
        setError("제목과 슬러그는 필수입니다.");
        return;
      }

      setSaving(true);
      setError(null);

      try {
        const payload: Record<string, unknown> = {
          title: title.trim(),
          slug: slug.trim(),
          excerpt: excerpt.trim(),
          content,
          category,
          tags,
          status: saveStatus,
          read_time: readTime,
          faqs: faqs.filter((f) => f.q.trim() && f.a.trim()),
          author: "도메인체커",
        };

        const url = "/api/admin/posts";
        let method = "POST";

        if (isEditing) {
          method = "PATCH";
          payload.id = post!.id;
        }

        const res = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error ?? "저장 실패");
        }

        onSave();
      } catch (err) {
        setError(err instanceof Error ? err.message : "저장 중 오류 발생");
      } finally {
        setSaving(false);
      }
    },
    [title, slug, excerpt, content, category, tags, readTime, faqs, isEditing, post, onSave]
  );

  const handleDelete = useCallback(async () => {
    if (!post?.id) return;
    if (!confirm("정말 이 글을 삭제하시겠습니까?")) return;

    setSaving(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/posts", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: post.id }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "삭제 실패");
      }

      onSave();
    } catch (err) {
      setError(err instanceof Error ? err.message : "삭제 중 오류 발생");
    } finally {
      setSaving(false);
    }
  }, [post, onSave]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={onCancel}>
          <ArrowLeft className="mr-1 h-4 w-4" />
          목록으로
        </Button>
        <h2 className="text-lg font-bold">
          {isEditing ? "글 수정" : "새 글 작성"}
        </h2>
      </div>

      {error && (
        <div className="rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Metadata */}
      <Card className="border-border/60">
        <CardContent className="p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-medium">제목</label>
              <Input
                placeholder="블로그 글 제목"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">슬러그</label>
              <Input
                placeholder="url-friendly-slug (영문 소문자, 하이픈)"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                required
              />
              <p className="mt-1 text-xs text-muted-foreground">
                URL 경로: /blog/{slug || "..."}
              </p>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">
                카테고리
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as BlogCategory)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">태그</label>
              <div className="flex flex-wrap items-center gap-1.5 rounded-md border border-input bg-transparent px-2 py-1.5 min-h-[36px]">
                {tags.map((tag, i) => (
                  <Badge key={i} variant="secondary" className="text-xs gap-1">
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(i)}
                      className="ml-0.5 hover:text-destructive"
                    >
                      &times;
                    </button>
                  </Badge>
                ))}
                <input
                  className="flex-1 min-w-[80px] bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                  placeholder="태그 입력 후 Enter"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">
                읽기 시간
              </label>
              <Input
                placeholder="5분"
                value={readTime}
                onChange={(e) => setReadTime(e.target.value)}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-medium">요약</label>
              <textarea
                className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-y"
                placeholder="글 요약 (목록 카드에 표시됩니다)"
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content Editor */}
      <Card className="border-border/60">
        <CardContent className="p-6">
          <div className="mb-3 flex items-center justify-between">
            <label className="text-sm font-medium">본문 (HTML)</label>
            <div className="flex gap-1">
              <Button
                variant={!previewMode ? "default" : "ghost"}
                size="sm"
                onClick={() => setPreviewMode(false)}
              >
                <Code className="mr-1 h-3.5 w-3.5" />
                코드
              </Button>
              <Button
                variant={previewMode ? "default" : "ghost"}
                size="sm"
                onClick={() => setPreviewMode(true)}
              >
                <Eye className="mr-1 h-3.5 w-3.5" />
                미리보기
              </Button>
            </div>
          </div>

          {previewMode ? (
            <div
              className="blog-prose min-h-[400px] rounded-md border border-border bg-background p-6"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          ) : (
            <HtmlEditor value={content} onChange={setContent} />
          )}
        </CardContent>
      </Card>

      {/* FAQ Section */}
      <Card className="border-border/60">
        <CardContent className="p-6">
          <div className="mb-3 flex items-center justify-between">
            <label className="text-sm font-medium">
              FAQ ({faqs.length}개)
            </label>
            <Button variant="outline" size="sm" onClick={addFaq}>
              <Plus className="mr-1 h-3.5 w-3.5" />
              질문 추가
            </Button>
          </div>

          {faqs.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              FAQ가 없습니다. 질문/답변을 추가하면 JSON-LD로 구조화됩니다.
            </p>
          ) : (
            <div className="space-y-4">
              {faqs.map((faq, idx) => (
                <div key={idx} className="rounded-md border border-border/60 p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">
                      Q{idx + 1}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFaq(idx)}
                      className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  <Input
                    placeholder="질문"
                    value={faq.q}
                    onChange={(e) => updateFaq(idx, "q", e.target.value)}
                    className="mb-2"
                  />
                  <textarea
                    className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-y"
                    placeholder="답변"
                    value={faq.a}
                    onChange={(e) => updateFaq(idx, "a", e.target.value)}
                  />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border/60 bg-muted/30 p-4">
        <div className="flex items-center gap-3">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as "draft" | "published")}
            className="flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="draft">초안</option>
            <option value="published">발행</option>
          </select>

          {isEditing && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              disabled={saving}
              className="text-destructive hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash2 className="mr-1 h-3.5 w-3.5" />
              삭제
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => handleSave("draft")}
            disabled={saving}
          >
            {saving ? (
              <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
            ) : (
              <Save className="mr-1 h-3.5 w-3.5" />
            )}
            초안 저장
          </Button>
          <Button onClick={() => handleSave("published")} disabled={saving}>
            {saving ? (
              <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
            ) : (
              <Send className="mr-1 h-3.5 w-3.5" />
            )}
            발행
          </Button>
        </div>
      </div>
    </div>
  );
}
