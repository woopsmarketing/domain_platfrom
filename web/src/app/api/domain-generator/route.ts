import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const RDAP_BASE = "https://rdap.org/domain";
const RDAP_TIMEOUT_MS = 3000;

const ALLOWED_TLDS = new Set([
  "com", "net", "org", "io", "ai", "co", "dev", "app",
]);

// ---------- 한국어 → 영어 키워드 매핑 (흔한 비즈니스 단어) ----------
const KO_TO_EN: Record<string, string[]> = {
  "위드": ["with", "weed", "wid"],
  "커피": ["coffee", "cafe", "brew"],
  "쇼핑": ["shop", "store", "mall"],
  "여행": ["travel", "trip", "tour"],
  "뷰티": ["beauty", "glow", "bloom"],
  "테크": ["tech", "code", "dev"],
  "건강": ["health", "fit", "wellness"],
  "음식": ["food", "eat", "yum"],
  "패션": ["fashion", "style", "vogue"],
  "교육": ["edu", "learn", "study"],
  "금융": ["finance", "money", "pay"],
  "부동산": ["realty", "home", "house"],
  "게임": ["game", "play", "fun"],
  "음악": ["music", "beat", "tune"],
  "디자인": ["design", "pixel", "craft"],
  "마케팅": ["market", "growth", "boost"],
  "사진": ["photo", "snap", "lens"],
  "영상": ["video", "film", "media"],
  "반려동물": ["pet", "paw", "buddy"],
  "자동차": ["auto", "car", "drive"],
};

function koreanToEnglish(keyword: string): string[] {
  // 한국어 키워드를 영어로 변환
  const lower = keyword.trim().toLowerCase();
  if (KO_TO_EN[lower]) return KO_TO_EN[lower];

  // 부분 매칭
  const results: string[] = [];
  for (const [ko, enList] of Object.entries(KO_TO_EN)) {
    if (lower.includes(ko)) {
      results.push(...enList);
    }
  }
  if (results.length > 0) return results;

  // 한국어가 감지되면 기본 로마자화 시도
  if (/[가-힣]/.test(keyword)) {
    return [keyword]; // 그대로 반환 (OpenAI가 처리)
  }

  return [lower.replace(/[^a-z0-9]/g, "")];
}

// ---------- Fallback 단어 조합 ----------

const PREFIXES = ["get", "my", "the", "go", "try", "use", "hey", "just", "one", "top"];
const SEO_SUFFIXES = ["hub", "lab", "pro", "plus", "hq", "zone", "spot", "base", "works", "central", "site", "page", "now", "app", "box"];
const BRAND_SUFFIXES = ["ly", "ify", "zy", "io", "ia", "er", "eo", "ix", "os", "vu"];
const COMBO_WORDS = ["smart", "fast", "easy", "mega", "ultra", "neo", "next", "flow", "wave", "link", "click", "snap", "dash", "stack", "spark"];

function generateFallbackNames(
  keyword: string,
  style: string,
  tlds: string[]
): string[] {
  const englishWords = koreanToEnglish(keyword);
  const names: Set<string> = new Set();

  for (const kw of englishWords) {
    const clean = kw.replace(/[^a-z0-9]/g, "");
    if (!clean) continue;

    if (style === "seo") {
      // 키워드 + 접미사
      for (const suffix of SEO_SUFFIXES) {
        names.add(`${clean}${suffix}`);
      }
      // 접두사 + 키워드
      for (const prefix of PREFIXES) {
        names.add(`${prefix}${clean}`);
      }
      // 키워드 + 콤보워드
      for (const combo of COMBO_WORDS.slice(0, 5)) {
        names.add(`${clean}${combo}`);
      }
    } else if (style === "brand") {
      // 짧은 창의적 이름
      for (const suffix of BRAND_SUFFIXES) {
        names.add(`${clean}${suffix}`);
      }
      // 축약 + 접미사
      if (clean.length >= 4) {
        const abbr = clean.slice(0, 3);
        for (const suffix of BRAND_SUFFIXES) {
          names.add(`${abbr}${suffix}`);
        }
      }
      // 콤보워드 + 키워드
      for (const combo of COMBO_WORDS.slice(0, 5)) {
        names.add(`${combo}${clean}`);
      }
    } else {
      // 유사성
      for (const combo of COMBO_WORDS) {
        names.add(`${clean}${combo}`);
        names.add(`${combo}${clean}`);
      }
      // 변형
      names.add(`${clean}x`);
      names.add(`${clean}z`);
      names.add(`x${clean}`);
      names.add(`i${clean}`);
      names.add(`re${clean}`);
    }
  }

  // 이름만 생성 (TLD 없이), 최대 20개 unique
  const uniqueNames = Array.from(names).slice(0, 20);

  // TLD 붙이기 — 각 이름에 첫 번째 TLD만 붙여서 20개 반환
  const domains: string[] = [];
  for (const name of uniqueNames) {
    // TLD를 라운드로빈으로 분배
    const tld = tlds[domains.length % tlds.length];
    domains.push(`${name}.${tld}`);
  }

  return domains;
}

// ---------- OpenAI ----------

async function generateWithOpenAI(
  keyword: string,
  style: string,
  tlds: string[]
): Promise<string[]> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return [];

  const isKorean = /[가-힣]/.test(keyword);
  const langNote = isKorean
    ? `The keyword "${keyword}" is Korean. Generate English domain names that relate to the meaning or sound of this Korean word.`
    : "";

  const styleGuides: Record<string, string> = {
    seo: `SEO-optimized names: Include the keyword or its meaning. Should be descriptive and easy to understand. Examples for "coffee": coffeehub, bestcoffee, getcoffee, coffeespot, dailycoffee`,
    brand: `Brandable names: Short (4-8 chars), catchy, memorable, can be made-up words. Think like Spotify, Shopify, Canva. Examples for "coffee": brewly, cafex, kopio, sippr, javva`,
    similarity: `Names inspired by successful brands: Combine the keyword concept with trendy patterns. Examples for "coffee": coffeenow, brewstack, cafedash, roastflow, beanwave`,
  };

  const prompt = `Generate exactly 20 unique domain name ideas (name part only, NO TLD extension).

Keyword: "${keyword}"
${langNote}
Style: ${styleGuides[style] ?? styleGuides.seo}

CRITICAL RULES:
- Lowercase only, letters and numbers only (no hyphens, no dots, no TLD)
- Length: 4 to 12 characters
- EVERY name MUST be completely different from each other
- DO NOT just add prefix/suffix to the keyword repeatedly
- At least 5 names should NOT contain the original keyword at all
- Use diverse naming techniques:
  * Portmanteau/blends (e.g., "Pinterest" = pin + interest)
  * Invented words (e.g., "Kodak", "Xerox")
  * Metaphors (e.g., "Amazon" for vastness)
  * Phonetic play (e.g., "Lyft" for lift)
  * Abbreviations (e.g., "Imgur" for image)
  * Foreign words (e.g., Latin, Japanese, etc.)
  * Emotional words related to the concept
- Make names that sound good when spoken aloud
- Think about what successful startups would name their product

Return ONLY a valid JSON array of 20 strings. No explanation.`;

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 1.0,
        max_tokens: 500,
      }),
    });

    if (!res.ok) return [];

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content?.trim() ?? "";
    const match = content.match(/\[[\s\S]*\]/);
    if (!match) return [];

    const parsed = JSON.parse(match[0]) as string[];
    const cleaned = parsed
      .filter((n: string) => typeof n === "string" && /^[a-z0-9]+$/.test(n) && n.length >= 3)
      .slice(0, 20);

    // TLD를 라운드로빈으로 분배 — 다양하게
    const domains: string[] = [];
    for (let i = 0; i < cleaned.length; i++) {
      const tld = tlds[i % tlds.length];
      domains.push(`${cleaned[i]}.${tld}`);
    }
    return domains;
  } catch {
    return [];
  }
}

// ---------- RDAP ----------

async function checkAvailability(domain: string): Promise<boolean | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), RDAP_TIMEOUT_MS);
  try {
    const res = await fetch(`${RDAP_BASE}/${domain}`, {
      signal: controller.signal,
      headers: { Accept: "application/rdap+json" },
    });
    clearTimeout(timer);
    if (res.status === 404) return true;
    if (res.status === 200) return false;
    return null;
  } catch {
    clearTimeout(timer);
    return null;
  }
}

// ---------- Route handler ----------

export async function POST(request: NextRequest) {
  let body: { keyword?: string; tlds?: string[]; style?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const keyword = body.keyword?.trim();
  if (!keyword || keyword.length === 0 || keyword.length > 50) {
    return NextResponse.json(
      { error: "keyword is required (max 50 chars)" },
      { status: 400 }
    );
  }

  const style = ["seo", "brand", "similarity"].includes(body.style ?? "")
    ? (body.style as string)
    : "seo";

  const tlds = (body.tlds ?? ["com", "net", "io"])
    .map((t: string) => t.toLowerCase())
    .filter((t: string) => ALLOWED_TLDS.has(t));

  if (tlds.length === 0) {
    return NextResponse.json(
      { error: "No valid TLDs specified" },
      { status: 400 }
    );
  }

  // Try OpenAI first, fallback to word combination
  let domainNames = await generateWithOpenAI(keyword, style, tlds);
  if (domainNames.length === 0) {
    domainNames = generateFallbackNames(keyword, style, tlds);
  }

  // Check availability in parallel
  const settled = await Promise.allSettled(
    domainNames.map(async (domain) => ({
      domain,
      available: await checkAvailability(domain),
    }))
  );

  const names = settled
    .filter(
      (r): r is PromiseFulfilledResult<{ domain: string; available: boolean | null }> =>
        r.status === "fulfilled"
    )
    .map((r) => r.value);

  return NextResponse.json({ names });
}
