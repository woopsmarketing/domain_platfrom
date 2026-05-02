import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  getCachedMetrics,
  getCachedBacklink,
  getCachedSerp,
  saveMetricsToCache,
  saveBacklinkToCache,
  saveSerpToCache,
} from "@/lib/external/backlinkshop-cache";

// ──────────────────────────────────────────
// fetch mock 설정
// ──────────────────────────────────────────
const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

// 환경변수 mock
const ENV_BACKUP: Record<string, string | undefined> = {};

function setEnv(key: string, value: string) {
  ENV_BACKUP[key] = process.env[key];
  process.env[key] = value;
}
function restoreEnv(key: string) {
  if (ENV_BACKUP[key] === undefined) delete process.env[key];
  else process.env[key] = ENV_BACKUP[key];
}

beforeEach(() => {
  mockFetch.mockReset();
  setEnv("CACHE_API_URL", "https://backlinkshop.co.kr");
  setEnv("CACHE_API_KEY", "bls-cache-x7k9m2p4");
});

afterEach(() => {
  restoreEnv("CACHE_API_URL");
  restoreEnv("CACHE_API_KEY");
});

// ──────────────────────────────────────────
// getCachedMetrics
// ──────────────────────────────────────────
describe("getCachedMetrics", () => {
  it("캐시 히트 시 데이터 반환", async () => {
    const mockData = {
      source: "cache",
      domain: "naver.com",
      data: { mozDA: 91, ahrefsDR: 89, majesticTF: 65 },
      fetched_at: "2026-04-23T00:00:00Z",
    };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    });

    const result = await getCachedMetrics("naver.com");

    expect(result).not.toBeNull();
    expect(result?.source).toBe("cache");
    expect(result?.data.mozDA).toBe(91);
    expect(result?.data.ahrefsDR).toBe(89);
  });

  it("올바른 URL과 헤더로 요청", async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ data: {} }) });

    await getCachedMetrics("example.com");

    expect(mockFetch).toHaveBeenCalledWith(
      "https://backlinkshop.co.kr/api/cache/metrics?domain=example.com",
      expect.objectContaining({
        headers: expect.objectContaining({ "x-api-key": "bls-cache-x7k9m2p4" }),
      })
    );
  });

  it("HTTP 오류 시 null 반환", async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 404 });
    const result = await getCachedMetrics("unknown.com");
    expect(result).toBeNull();
  });

  it("네트워크 오류 시 null 반환 (throw 안 함)", async () => {
    mockFetch.mockRejectedValueOnce(new Error("Network error"));
    await expect(getCachedMetrics("fail.com")).resolves.toBeNull();
  });

  it("CACHE_API_KEY 미설정 시 fetch 호출 없이 null 반환", async () => {
    restoreEnv("CACHE_API_KEY");
    delete process.env.CACHE_API_KEY;

    const result = await getCachedMetrics("naver.com");

    expect(result).toBeNull();
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("도메인에 특수문자 포함 시 URL 인코딩", async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ data: {} }) });

    await getCachedMetrics("sub.example.com");

    const calledUrl = mockFetch.mock.calls[0][0] as string;
    expect(calledUrl).toContain("domain=sub.example.com");
  });
});

// ──────────────────────────────────────────
// getCachedBacklink
// ──────────────────────────────────────────
describe("getCachedBacklink", () => {
  it("캐시 히트 시 백링크 데이터 반환", async () => {
    const mockData = {
      source: "cache",
      domain: "naver.com",
      data: {
        backlinkTotal: 5000,
        backlinkDoFollow: 3000,
        referringDomains: 800,
        referringDoFollow: 600,
      },
      fetched_at: "2026-04-23T00:00:00Z",
    };
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => mockData });

    const result = await getCachedBacklink("naver.com");

    expect(result?.data.backlinkTotal).toBe(5000);
    expect(result?.data.backlinkDoFollow).toBe(3000);
    expect(result?.data.referringDomains).toBe(800);
  });

  it("올바른 엔드포인트 호출", async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ data: {} }) });

    await getCachedBacklink("test.com");

    const calledUrl = mockFetch.mock.calls[0][0] as string;
    expect(calledUrl).toContain("/api/cache/backlink");
    expect(calledUrl).toContain("domain=test.com");
  });

  it("HTTP 오류 시 null 반환", async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 500 });
    expect(await getCachedBacklink("test.com")).toBeNull();
  });

  it("네트워크 오류 시 null 반환", async () => {
    mockFetch.mockRejectedValueOnce(new Error("timeout"));
    await expect(getCachedBacklink("test.com")).resolves.toBeNull();
  });
});

// ──────────────────────────────────────────
// getCachedSerp
// ──────────────────────────────────────────
describe("getCachedSerp", () => {
  it("캐시 히트 시 SERP 데이터 반환", async () => {
    const mockData = {
      source: "api",
      keyword: "도메인 구매",
      data: [
        { url: "https://godaddy.com", title: "GoDaddy" },
        { url: "https://namecheap.com", title: "Namecheap" },
      ],
      fetched_at: "2026-04-23T00:00:00Z",
    };
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => mockData });

    const result = await getCachedSerp("도메인 구매");

    expect(result?.source).toBe("api");
    expect(result?.data).toHaveLength(2);
    expect(result?.data[0].url).toBe("https://godaddy.com");
  });

  it("키워드 URL 인코딩 처리", async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ data: [] }) });

    await getCachedSerp("도메인 구매");

    const calledUrl = mockFetch.mock.calls[0][0] as string;
    expect(calledUrl).toContain("/api/cache/serp");
    expect(calledUrl).toContain("keyword=");
    // 한글이 인코딩되었는지 확인
    expect(calledUrl).not.toContain("도메인 구매");
  });

  it("HTTP 오류 시 null 반환", async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 503 });
    expect(await getCachedSerp("keyword")).toBeNull();
  });
});

// ──────────────────────────────────────────
// saveMetricsToCache
// ──────────────────────────────────────────
describe("saveMetricsToCache", () => {
  it("올바른 POST 요청 전송", async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ success: true }) });

    await saveMetricsToCache("naver.com", { mozDA: 91, ahrefsDR: 89 });

    expect(mockFetch).toHaveBeenCalledWith(
      "https://backlinkshop.co.kr/api/cache/metrics",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({ "x-api-key": "bls-cache-x7k9m2p4" }),
        body: JSON.stringify({ domain: "naver.com", metrics: { mozDA: 91, ahrefsDR: 89 } }),
      })
    );
  });

  it("실패해도 throw 하지 않음", async () => {
    mockFetch.mockRejectedValueOnce(new Error("Network error"));
    await expect(saveMetricsToCache("fail.com", {})).resolves.toBeUndefined();
  });

  it("CACHE_API_KEY 미설정 시 fetch 호출 안 함", async () => {
    restoreEnv("CACHE_API_KEY");
    delete process.env.CACHE_API_KEY;

    await saveMetricsToCache("naver.com", { mozDA: 91 });

    expect(mockFetch).not.toHaveBeenCalled();
  });
});

// ──────────────────────────────────────────
// saveBacklinkToCache
// ──────────────────────────────────────────
describe("saveBacklinkToCache", () => {
  it("올바른 POST 요청 전송", async () => {
    mockFetch.mockResolvedValueOnce({ ok: true });

    await saveBacklinkToCache("naver.com", {
      backlinkTotal: 5000,
      backlinkDoFollow: 3000,
      referringDomains: 800,
      referringDoFollow: 600,
    });

    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toBe("https://backlinkshop.co.kr/api/cache/backlink");
    expect(options.method).toBe("POST");
    const body = JSON.parse(options.body);
    expect(body.domain).toBe("naver.com");
    expect(body.metrics.backlinkTotal).toBe(5000);
  });

  it("실패해도 throw 하지 않음", async () => {
    mockFetch.mockRejectedValueOnce(new Error("500 error"));
    await expect(
      saveBacklinkToCache("fail.com", {
        backlinkTotal: null,
        backlinkDoFollow: null,
        referringDomains: null,
        referringDoFollow: null,
      })
    ).resolves.toBeUndefined();
  });
});

// ──────────────────────────────────────────
// saveSerpToCache
// ──────────────────────────────────────────
describe("saveSerpToCache", () => {
  it("올바른 POST 요청 전송", async () => {
    mockFetch.mockResolvedValueOnce({ ok: true });
    const results = [
      { url: "https://godaddy.com", title: "GoDaddy" },
      { url: "https://namecheap.com", title: "Namecheap" },
    ];

    await saveSerpToCache("도메인 구매", results);

    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toBe("https://backlinkshop.co.kr/api/cache/serp");
    expect(options.method).toBe("POST");
    const body = JSON.parse(options.body);
    expect(body.keyword).toBe("도메인 구매");
    expect(body.results).toHaveLength(2);
    expect(body.results[0].url).toBe("https://godaddy.com");
  });

  it("실패해도 throw 하지 않음", async () => {
    mockFetch.mockRejectedValueOnce(new Error("timeout"));
    await expect(saveSerpToCache("keyword", [])).resolves.toBeUndefined();
  });
});

// ──────────────────────────────────────────
// CACHE_API_URL 커스텀 설정
// ──────────────────────────────────────────
describe("커스텀 CACHE_API_URL", () => {
  it("환경변수 CACHE_API_URL이 실제 요청 URL에 반영됨", async () => {
    process.env.CACHE_API_URL = "https://custom-cache.example.com";
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ data: {} }) });

    await getCachedMetrics("test.com");

    const calledUrl = mockFetch.mock.calls[0][0] as string;
    expect(calledUrl).toContain("https://custom-cache.example.com");

    process.env.CACHE_API_URL = "https://backlinkshop.co.kr";
  });
});
