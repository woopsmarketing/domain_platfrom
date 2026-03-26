import { NextRequest, NextResponse } from "next/server";
import { checkApiRateLimit, isProUser } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";
export const maxDuration = 30; // Vercel 함수 타임아웃 30초 (GPT-5 reasoning 대응)

const RDAP_BASE = "https://rdap.org/domain";
const RDAP_TIMEOUT_MS = 3000;

const ALLOWED_TLDS = new Set(["com", "net", "org", "io", "ai", "co", "dev", "app"]);

// ---------- 한국어 → 영어 키워드 매핑 (단어 단위) ----------
const KO_WORD: Record<string, string> = {
  "커피": "coffee", "카페": "cafe", "쇼핑": "shop", "매장": "store", "몰": "mall",
  "여행": "travel", "투어": "tour", "뷰티": "beauty", "미용": "beauty",
  "테크": "tech", "기술": "tech", "건강": "health", "헬스": "fitness",
  "음식": "food", "맛집": "foodie", "패션": "fashion", "스타일": "style",
  "교육": "edu", "학습": "learn", "금융": "finance", "돈": "money",
  "부동산": "realty", "집": "home", "게임": "game", "놀이": "play",
  "디자인": "design", "마케팅": "market", "광고": "advert",
  "도메인": "domain", "사이트": "site", "웹": "web",
  "분석": "analyze", "검색": "search", "확인": "check", "조회": "lookup",
  "가격": "price", "비교": "compare", "추천": "pick", "무료": "free",
  "온라인": "online", "서비스": "service", "플랫폼": "platform",
  "스타트업": "startup", "블로그": "blog", "뉴스": "news",
  "사진": "photo", "영상": "video", "음악": "music",
  "반려동물": "pet", "강아지": "puppy", "고양이": "cat",
  "자동차": "car", "차": "car", "중고": "used", "새": "new",
  "호스팅": "host", "클라우드": "cloud", "서버": "server",
  "스포츠": "sport", "중계": "live", "방송": "cast", "라이브": "live",
  "의료": "medical", "병원": "clinic", "약": "pharma",
  "법률": "legal", "변호사": "lawyer", "회계": "account",
  "요리": "cook", "레시피": "recipe", "배달": "delivery",
  "택시": "taxi", "운송": "transport", "물류": "logistics",
  "보험": "insure", "투자": "invest", "주식": "stock", "코인": "crypto",
  "인테리어": "interior", "가구": "furniture", "리모델링": "remodel",
  "결혼": "wedding", "웨딩": "wedding", "파티": "party",
  "꽃": "flower", "선물": "gift", "케이크": "cake",
  "영어": "english", "수학": "math", "과외": "tutor",
  "취업": "career", "이력서": "resume", "채용": "hiring",
  "렌탈": "rental", "대여": "rental", "구독": "subscribe",
  "예약": "booking", "호텔": "hotel", "숙소": "stay",
  "피트니스": "fitness", "요가": "yoga", "필라테스": "pilates", "다이어트": "diet",
  "네일": "nail", "헤어": "hair", "메이크업": "makeup",
  "세차": "carwash", "정비": "repair", "수리": "fix",
  "청소": "clean", "이사": "moving", "세탁": "laundry",
};

function koreanToEnglish(keyword: string): string[] {
  const lower = keyword.trim();

  // 정확한 매칭
  if (KO_WORD[lower]) return [KO_WORD[lower]];

  // 부분 매칭 — 여러 단어 조합 수집
  const found: string[] = [];
  for (const [ko, en] of Object.entries(KO_WORD)) {
    if (lower.includes(ko)) {
      if (!found.includes(en)) found.push(en);
    }
  }
  if (found.length > 0) return found;

  // 영어 부분 추출 (한영 혼합 입력)
  const englishPart = lower.replace(/[가-힣\s]/g, "").toLowerCase();
  if (englishPart.length >= 2) return [englishPart];

  // 최종 fallback — 한국어인데 매핑이 없으면 빈 배열 (OpenAI에 위임)
  if (/[가-힣]/.test(keyword)) return [];

  const cleaned = lower.replace(/[^a-z0-9]/g, "");
  return cleaned ? [cleaned] : [];
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
  let englishWords = koreanToEnglish(keyword);

  // 영어 단어가 없으면 fallback 불가 → 빈 결과 반환
  if (englishWords.length === 0) {
    return { seo: [], brand: [], similar: [] };
  }

  // 여러 단어가 있으면 조합도 추가 (예: ["used","car"] → "usedcar")
  if (englishWords.length >= 2) {
    englishWords = [...englishWords, englishWords.join("")];
  }

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
  const langNote = isKorean ? ` (Korean word — generate ENGLISH names based on its meaning)` : "";

  const prompt = `Domain names for "${keyword}"${langNote}. JSON only, 20 names:
{"seo":[7 SEO names with keyword],"brand":[7 short invented words WITHOUT "${keyword}"],"similar":[6 trendy compound names]}
Rules: lowercase, 3-14 chars, hyphens OK, no dots/TLD. Brand must NOT contain the keyword.`;

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: "gpt-5-nano-2025-08-07",
        messages: [{ role: "user", content: prompt }],
        max_completion_tokens: 8000,
      }),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      console.error("OpenAI error:", res.status, errText.slice(0, 200));
      return null;
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content?.trim() ?? "";
    const finishReason = data.choices?.[0]?.finish_reason ?? "";
    const reasoning = data.usage?.completion_tokens_details?.reasoning_tokens ?? 0;

    if (!content) {
      console.error("OpenAI empty content:", finishReason, reasoning);
      return null;
    }

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("OpenAI no JSON in response");
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
    console.error("OpenAI exception:", err);
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
  // Rate limit 체크
  const pro = await isProUser(request);
  if (!pro) {
    const rateLimit = await checkApiRateLimit("ai_generator", 10);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: "일일 사용 한도를 초과했습니다. Pro 구독으로 무제한 사용하세요.",
          limit: rateLimit.limit,
          used: rateLimit.used,
        },
        { status: 429 }
      );
    }
  }

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
