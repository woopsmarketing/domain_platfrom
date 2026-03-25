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
};

function koreanToEnglish(keyword: string): string[] {
  const lower = keyword.trim().toLowerCase();
  if (KO_TO_EN[lower]) return KO_TO_EN[lower];
  for (const [ko, enList] of Object.entries(KO_TO_EN)) {
    if (lower.includes(ko)) return enList;
  }
  if (/[가-힣]/.test(keyword)) return [keyword];
  return [lower.replace(/[^a-z0-9]/g, "")];
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
async function generateWithOpenAI(keyword: string, tlds: string[]): Promise<CategorizedNames | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  const isKorean = /[가-힣]/.test(keyword);
  const langNote = isKorean
    ? `The keyword "${keyword}" is Korean. Generate English domain names that relate to the meaning or sound.`
    : "";

  const prompt = `Generate domain name ideas for the keyword "${keyword}".
${langNote}

Generate exactly 20 names in 3 categories:
- "seo" (7 names): Keywords included, descriptive, SEO-friendly. e.g., coffeehub, bestcoffee, mycoffee
- "brand" (7 names): Short (4-8 chars), catchy, invented/creative words. Think Spotify, Canva, Zapier. Must NOT contain the original keyword.
- "similar" (6 names): Inspired by successful brands, trendy compound words. e.g., coffeeflow, brewstack, roastwave

CRITICAL RULES:
- Lowercase only, letters and numbers only (NO hyphens, NO dots, NO TLD extensions)
- 4 to 12 characters long
- EVERY name must be completely unique and different
- Brand names MUST NOT contain the original keyword at all
- Use diverse techniques: portmanteau, invented words, metaphors, phonetic play, abbreviations
- Names must sound good when spoken aloud

Return ONLY valid JSON: {"seo":["name1",...],"brand":["name1",...],"similar":["name1",...]}`;

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 1.0,
        max_tokens: 600,
      }),
    });

    if (!res.ok) return null;

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content?.trim() ?? "";
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    const parsed = JSON.parse(jsonMatch[0]) as { seo?: string[]; brand?: string[]; similar?: string[] };
    const clean = (arr: string[] | undefined) =>
      (arr ?? []).filter((n) => typeof n === "string" && /^[a-z0-9]+$/.test(n) && n.length >= 3 && n.length <= 15);

    return {
      seo: clean(parsed.seo).slice(0, 7),
      brand: clean(parsed.brand).slice(0, 7),
      similar: clean(parsed.similar).slice(0, 6),
    };
  } catch {
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
  let categorized = await generateWithOpenAI(keyword, tlds);
  if (!categorized) {
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
  });
}
