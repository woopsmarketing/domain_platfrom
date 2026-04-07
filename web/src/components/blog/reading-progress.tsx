"use client";

import { useEffect, useState } from "react";

export function ReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    function handleScroll() {
      const article = document.querySelector("article");
      if (!article) return;
      const rect = article.getBoundingClientRect();
      const articleTop = rect.top + window.scrollY;
      const articleHeight = article.offsetHeight;
      const windowHeight = window.innerHeight;
      const scrollY = window.scrollY;
      const start = articleTop;
      const end = articleTop + articleHeight - windowHeight;
      const current = Math.max(0, Math.min(1, (scrollY - start) / (end - start)));
      setProgress(Math.round(current * 100));
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="blog-progress-wrap">
      <div className="blog-progress-label">
        <span>읽기 진행률</span>
        <span>{progress}%</span>
      </div>
      <div className="blog-progress-bar">
        <div className="blog-progress-fill" style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}
