"use client";

import { useEffect, useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Plus, FileText, Pencil, ExternalLink } from "lucide-react";
import { CATEGORY_COLORS, type BlogCategory } from "@/lib/blog";
import type { Post } from "@/lib/db/posts";
import { BlogEditor } from "./blog-editor";

type ViewMode = "list" | "new" | "edit";
type StatusFilter = "all" | "draft" | "published";

export function BlogPostsTab() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [editingPost, setEditingPost] = useState<Post | undefined>(undefined);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/posts");
      const data = await res.json();
      setPosts(data.posts ?? []);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleNew = useCallback(() => {
    setEditingPost(undefined);
    setViewMode("new");
  }, []);

  const handleEdit = useCallback((post: Post) => {
    setEditingPost(post);
    setViewMode("edit");
  }, []);

  const handleSaveComplete = useCallback(() => {
    setViewMode("list");
    setEditingPost(undefined);
    fetchPosts();
  }, [fetchPosts]);

  const handleCancel = useCallback(() => {
    setViewMode("list");
    setEditingPost(undefined);
  }, []);

  // Editor view
  if (viewMode === "new" || viewMode === "edit") {
    return (
      <BlogEditor
        post={editingPost}
        onSave={handleSaveComplete}
        onCancel={handleCancel}
      />
    );
  }

  // List view
  const filteredPosts =
    statusFilter === "all"
      ? posts
      : posts.filter((p) => p.status === statusFilter);

  const draftCount = posts.filter((p) => p.status === "draft").length;
  const publishedCount = posts.filter((p) => p.status === "published").length;

  if (loading) {
    return (
      <p className="py-8 text-center text-muted-foreground">로딩 중...</p>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <p className="text-sm text-muted-foreground">
            총 {posts.length}개
          </p>
          <div className="flex gap-1">
            <Button
              variant={statusFilter === "all" ? "default" : "ghost"}
              size="sm"
              onClick={() => setStatusFilter("all")}
              className="h-7 text-xs"
            >
              전체
            </Button>
            <Button
              variant={statusFilter === "draft" ? "default" : "ghost"}
              size="sm"
              onClick={() => setStatusFilter("draft")}
              className="h-7 text-xs"
            >
              초안 ({draftCount})
            </Button>
            <Button
              variant={statusFilter === "published" ? "default" : "ghost"}
              size="sm"
              onClick={() => setStatusFilter("published")}
              className="h-7 text-xs"
            >
              발행 ({publishedCount})
            </Button>
          </div>
        </div>
        <Button size="sm" onClick={handleNew}>
          <Plus className="h-4 w-4" />
          새 글 작성
        </Button>
      </div>

      {/* Table */}
      <Card className="border-border/60">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>제목</TableHead>
              <TableHead className="hidden sm:table-cell">카테고리</TableHead>
              <TableHead>상태</TableHead>
              <TableHead className="hidden md:table-cell">발행일</TableHead>
              <TableHead className="hidden md:table-cell">읽기시간</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPosts.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="py-12 text-center text-muted-foreground"
                >
                  <FileText className="mx-auto mb-2 h-8 w-8 opacity-40" />
                  {statusFilter === "all"
                    ? "아직 작성된 글이 없습니다"
                    : `${statusFilter === "draft" ? "초안" : "발행된"} 글이 없습니다`}
                </TableCell>
              </TableRow>
            ) : (
              filteredPosts.map((post) => (
                <TableRow
                  key={post.id}
                  className="cursor-pointer"
                  onClick={() => handleEdit(post)}
                >
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium line-clamp-1">
                        {post.title}
                      </span>
                      <span className="text-xs text-muted-foreground line-clamp-1 sm:hidden">
                        {post.category}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <Badge
                      variant="outline"
                      className={`text-xs ${CATEGORY_COLORS[post.category as BlogCategory] ?? ""}`}
                    >
                      {post.category}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        post.status === "published" ? "active" : "secondary"
                      }
                      className="text-xs"
                    >
                      {post.status === "published" ? "발행" : "초안"}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                    {post.published_at
                      ? new Date(post.published_at).toLocaleDateString("ko-KR")
                      : "-"}
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                    {post.read_time}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        title="새 탭에서 보기"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(`/blog/${post.slug}`, "_blank");
                        }}
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        title="편집"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(post);
                        }}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
