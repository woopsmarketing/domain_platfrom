"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface UseFetchOptions {
  /** 캐시 유효 시간 (ms). 기본 60000 (1분) */
  cacheTime?: number;
  /** 자동 fetch 여부. 기본 true */
  enabled?: boolean;
}

interface UseFetchResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

// 메모리 캐시 (같은 세션 내 재사용)
const cache = new Map<string, { data: unknown; timestamp: number }>();

export function useFetch<T>(url: string | null, options: UseFetchOptions = {}): UseFetchResult<T> {
  const { cacheTime = 60000, enabled = true } = options;
  const [data, setData] = useState<T | null>(() => {
    if (!url) return null;
    const cached = cache.get(url);
    if (cached && Date.now() - cached.timestamp < cacheTime) {
      return cached.data as T;
    }
    return null;
  });
  const [loading, setLoading] = useState(!data);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const fetchData = useCallback(async () => {
    if (!url || !enabled) return;

    // 이미 캐시된 데이터가 있으면 로딩 false
    const cached = cache.get(url);
    if (cached && Date.now() - cached.timestamp < cacheTime) {
      setData(cached.data as T);
      setLoading(false);
    }

    // 백그라운드에서 갱신
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      if (!cached) setLoading(true);
      const res = await fetch(url, { signal: controller.signal });
      if (!res.ok) throw new Error(`${res.status}`);
      const json = await res.json();
      cache.set(url, { data: json, timestamp: Date.now() });
      setData(json);
      setError(null);
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      setError("데이터를 불러올 수 없습니다");
    } finally {
      setLoading(false);
    }
  }, [url, enabled, cacheTime]);

  useEffect(() => {
    fetchData();
    return () => abortRef.current?.abort();
  }, [fetchData]);

  const refresh = useCallback(() => {
    if (url) cache.delete(url);
    fetchData();
  }, [url, fetchData]);

  return { data, loading, error, refresh };
}
