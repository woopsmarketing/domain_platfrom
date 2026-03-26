"use client";

import { useState } from "react";
import Link from "next/link";
import { Lock, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface UpgradeModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
}

export function UpgradeModal({ open, onClose, title, description }: UpgradeModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="relative mx-4 w-full max-w-sm rounded-2xl border border-border/60 bg-card p-6 shadow-xl" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute right-3 top-3 rounded-md p-1 text-muted-foreground hover:text-foreground transition-colors" aria-label="닫기">
          <X className="h-4 w-4" />
        </button>
        <div className="flex flex-col items-center text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Lock className="h-6 w-6 text-primary" />
          </div>
          <h3 className="mb-1 text-lg font-semibold">{title || "일일 사용 한도에 도달했습니다"}</h3>
          <p className="mb-5 text-sm text-muted-foreground">
            {description || "Pro 구독으로 업그레이드하면 모든 기능을 무제한으로 사용할 수 있습니다."}
          </p>
          <div className="flex w-full flex-col gap-2">
            <Link href="/pricing" className="w-full">
              <Button className="w-full gap-2">
                <Sparkles className="h-4 w-4" />
                Pro 업그레이드
              </Button>
            </Link>
            <Button variant="ghost" size="sm" onClick={onClose} className="text-muted-foreground">
              나중에
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
