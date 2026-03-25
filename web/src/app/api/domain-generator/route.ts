import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const RDAP_BASE = "https://rdap.org/domain";
const RDAP_TIMEOUT_MS = 3000;

const ALLOWED_TLDS = new Set(["com", "net", "org", "io", "ai", "co", "dev", "app"]);

// ---------- 한국어 → 영어 키워드 매핑 ----------
const KO_TO_EN: Record<string, string[]> = {
  "커피": ["coffee", "cafe", "brew"], "쇼핑": ["shop", "store", "mall"],
  "여행": ["travel", "trip", "tour"], "뷰티": ["beauty", "glow", "bloom"],
  "테크": ["tech", "code", "dev"], "건강": ["health", "fit", "wellness"],
  "음식": ["food", "eat", "yum"], "패션": ["fashion", "style", "vogue"],
  "교육": ["edu", "learn", "study"], "금융": ["finance", "money", "pay"],
  "부동산": ["realty", "home", "house"], "게임": ["game", "play", "fun"],
  "디자인": ["design", "pixel", "craft"], "마케팅": ["market", "growth", "boost"],
  "도메인": ["domain", "site", "web"], "분석": ["analyze", "scan", "check"],
  "검색": ["search", "find", "seek"], "확인": ["check", "verify", "scan"],
  "가격": ["price", "cost", "value"], "비교": ["compare", "versus", "match"],
  "추천": ["pick", "suggest", "top"], "무료": ["free", "gratis", "open"],
  "온라인": ["online", "web", "net"], "서비스": ["service", "serve", "hub"],
  "플랫폼": ["platform", "base", "hub"], "스타트업": ["startup", "launch", "begin"],
  "블로그": ["blog", "post", "write"], "뉴스": ["news", "press", "feed"],
  "사진": ["photo", "snap", "lens"], "영상": ["video", "film", "media"],
  "음악": ["music", "beat", "tune"], "반려동물": ["pet", "paw", "buddy"],
  "자동차": ["auto", "car", "drive"], "호스팅": ["host", "cloud", "server"],
};

function koreanToEnglish(keyword: string): string[] {
  const lower = keyword.trim().toLowerCase();
  if (KO_TO_EN[lower]) return KO_TO_EN[lower];
  for (const [ko, enList] of Object.entries(KO_TO_EN)) {
    if (lower.includes(ko)) return enList;
  }
  if (/[가-힣]/.test(keyword)) {
    // 한국어 키워드 — 매핑에 없으면 일반적인 영어 키워드로 대체
    return ["web", "site", "app", "hub", "go"];
  }
  const cleaned = lower.replace(/[^a-z0-9]/g, "");
  return cleaned ? [cleaned] : ["web", "site", "app"];
}

// ---------- Fallback 단어 조합 ----------
const PREFIXES = ["get", "my", "the", "go", "try", "use", "hey", "just", "one", "top"];
const SEO_SUFFIXES = ["hub", "lab", "pro", "plus", "hq", "zone", "spot", "base", "works", "now"];
const BRAND_SUFFIXES = ["ly", "ify", "zy", "io", "ia", "er", "eo", "ix", "os", "vu"];
const COMBO_WORDS = ["smart", "fast", "easy", "mega", "neo", "next", "flow", "wave", "link", "snap", "dash", "stack", "spark"];

interface CategorizedNames {
  seo: string[];
  brand: string[];
  similar: string[];
}

function generateFallbackNames(keyword: string, tlds: string[]): CategorizedNames {
  const englishWords = koreanToEnglish(keyword);
  const seoNames: Set<string> = new Set();
  const brandNames: Set<string> = new Set();
  const similarNames: Set<string> = new Set();

  for (const kw of englishWords) {
    const clean = kw.replace(/[^a-z0-9]/g, "");
    if (!clean) continue;

    // SEO
    for (const suffix of SEO_SUFFIXES) seoNames.add(`${clean}${suffix}`);
    for (const prefix of PREFIXES.slice(0, 5)) seoNames.add(`${prefix}${clean}`);

    // Brand
    for (const suffix of BRAND_SUFFIXES) brandNames.add(`${clean}${suffix}`);
    if (clean.length > 3) brandNames.add(`${clean.slice(0, 4)}x`);
    if (clean.length > 3) brandNames.add(`${clean.slice(0, 3)}fy`);

    // Similar
    for (const combo of COMBO_WORDS.slice(0, 6)) {
      similarNames.add(`${clean}${combo}`);
      similarNames.add(`${combo}${clean}`);
    }
  }

  const assignTld = (names: string[], count: number) => {
    return Array.from(names).slice(0, count).map((n, i) => `${n}.${tlds[i % tlds.length]}`);
  };

  return {
    seo: assignTld(Array.from(seoNames), 7),
    brand: assignTld(Array.from(brandNames), 7),
    similar: assignTld(Array.from(similarNames), 6),
  };
}

// ---------- OpenAI ----------
let _lastOpenAIError = "";

async function generateWithOpenAI(keyword: string, tlds: string[]): Promise<CategorizedNames | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) { _lastOpenAIError = "no_api_key"; return null; }

  const isKorean = /[가-힣]/.test(keyword);
  const langNote = isKorean
    ? `IMPORTANT: The keyword "${keyword}" is in Korean. First understand its meaning, then generate ENGLISH domain names that capture the concept, meaning, or feeling of this Korean word. Do NOT transliterate Korean to English — translate the MEANING. For example: "도메인분석" means "domain analysis", "커피숍" means "coffee shop".`
    : "";

  const prompt = `You are a creative domain naming expert. Generate domain name ideas related to "${keyword}".
${langNote}

Return exactly 20 names in 3 categories as JSON:

"seo" (7 names): Include the keyword or a synonym. Descriptive and search-friendly.
  Example for "coffee": best-coffee, my-cafe, coffee-hub, get-brew, daily-coffee, top-roast, fresh-bean

"brand" (7 names): COMPLETELY NEW invented words. DO NOT include "${keyword}" or any part of it.
  Create short (3-7 char) catchy made-up words that FEEL related to the concept but use different words entirely.
  Example for "coffee": brewly, sipzr, kafex, muggo, roastio, javva, cupiq
  Example for "domaincheck": verfyx, sitepulse, webiq, dnslook, urlvox, netprobe, checkora

"similar" (6 names): Combine the concept with trendy words. Can use abbreviations or creative splits.
  Example for "coffee": brew-stack, cafe-dash, roast-flow, bean-wave, cup-spark, mocha-lab
  Example for "domaincheck": site-scan, web-audit, dns-pulse, url-check, net-verify, domain-spy

RULES:
- Lowercase only, letters, numbers, and hyphens allowed (NO dots, NO TLD)
- 3 to 14 characters
- Brand names MUST NOT contain "${keyword}" or any substring of it
- Each name must be unique and different from all others
- Hyphens are OK and encouraged for readability (e.g., "do-check", "web-scan")

Return ONLY: {"seo":["name1",...],"brand":["name1",...],"similar":["name1",...]}`;

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: "gpt-5-nano-2025-08-07",
        messages: [{ role: "user", content: prompt }],
        temperature: 1.2,
        max_completion_tokens: 4000,
      }),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      _lastOpenAIError = `http_${res.status}: ${errText.slice(0, 200)}`;
      return null;
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content?.trim() ?? "";
    const finishReason = data.choices?.[0]?.finish_reason ?? "";
    const reasoning = data.usage?.completion_tokens_details?.reasoning_tokens ?? 0;

    if (!content) {
      _lastOpenAIError = `empty_content(finish=${finishReason},reasoning=${reasoning},total=${data.usage?.completion_tokens ?? 0})`;
      return null;
    }

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      _lastOpenAIError = `no_json: ${content.slice(0, 100)}`;
      return null;
    }

    const parsed = JSON.parse(jsonMatch[0]) as { seo?: string[]; brand?: string[]; similar?: string[] };
    const clean = (arr: string[] | undefined) =>
      (arr ?? []).filter((n) => typeof n === "string" && /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/.test(n) && n.length >= 3 && n.length <= 15);

    return {
      seo: clean(parsed.seo).slice(0, 7),
      brand: clean(parsed.brand).slice(0, 7),
      similar: clean(parsed.similar).slice(0, 6),
    };
  } catch (err) {
    _lastOpenAIError = `exception: ${String(err).slice(0, 200)}`;
    return null;
  }
}

// ---------- 가용성 확인 (RDAP + DNS fallback) ----------
async function checkAvailability(domain: string): Promise<boolean | null> {
  // 1차: RDAP
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), RDAP_TIMEOUT_MS);
    const res = await fetch(`${RDAP_BASE}/${domain}`, {
      signal: controller.signal,
      headers: { Accept: "application/rdap+json" },
    });
    clearTimeout(timer);
    if (res.status === 404) return true;
    if (res.status === 200) return false;
  } catch { /* fallback */ }

  // 2차: DNS fallback
  try {
    const dnsResp = await fetch(
      `https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=A`,
      { signal: AbortSignal.timeout(2000) }
    );
    if (dnsResp.ok) {
      const dnsData = await dnsResp.json();
      if (dnsData.Status === 3) return true; // NXDOMAIN
      if (dnsData.Status === 0 && dnsData.Answer?.length > 0) return false;
    }
  } catch { /* give up */ }

  return null;
}

// ---------- Route handler ----------
export async function POST(request: NextRequest) {
  let body: { keyword?: string; tlds?: string[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const keyword = body.keyword?.trim();
  if (!keyword || keyword.length === 0 || keyword.length > 50) {
    return NextResponse.json({ error: "keyword is required (max 50 chars)" }, { status: 400 });
  }

  const tlds = (body.tlds ?? ["com", "net", "io"])
    .map((t: string) => t.toLowerCase())
    .filter((t: string) => ALLOWED_TLDS.has(t));

  if (tlds.length === 0) {
    return NextResponse.json({ error: "No valid TLDs specified" }, { status: 400 });
  }

  // OpenAI → fallback
  let aiSource = "openai";
  let aiError = "";
  let categorized = await generateWithOpenAI(keyword, tlds);
  if (!categorized) {
    aiSource = "fallback";
    categorized = generateFallbackNames(keyword, tlds);
  } else {
    // OpenAI는 이름만 반환하므로 TLD 붙이기
    const assignTld = (names: string[]) =>
      names.map((n, i) => `${n}.${tlds[i % tlds.length]}`);
    categorized = {
      seo: assignTld(categorized.seo),
      brand: assignTld(categorized.brand),
      similar: assignTld(categorized.similar),
    };
  }

  // 가용성 확인 — 전체 도메인 병렬
  const allDomains = [...categorized.seo, ...categorized.brand, ...categorized.similar];
  const settled = await Promise.allSettled(
    allDomains.map(async (domain) => ({
      domain,
      available: await checkAvailability(domain),
    }))
  );

  const availMap = new Map<string, boolean | null>();
  for (const r of settled) {
    if (r.status === "fulfilled") availMap.set(r.value.domain, r.value.available);
  }

  const toResult = (domains: string[]) =>
    domains.map((d) => ({ domain: d, available: availMap.get(d) ?? null }));

  return NextResponse.json({
    seo: toResult(categorized.seo),
    brand: toResult(categorized.brand),
    similar: toResult(categorized.similar),
    _source: aiSource,
    _error: aiSource === "fallback" ? _lastOpenAIError : undefined,
  });
}
