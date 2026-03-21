import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const RDAP_BASE = "https://rdap.org/domain";
const RDAP_TIMEOUT_MS = 3000;

const ALLOWED_TLDS = new Set([
  "com",
  "net",
  "org",
  "io",
  "ai",
  "co",
  "dev",
  "app",
]);

// ---------- Fallback word-combination logic ----------

const SEO_SUFFIXES = [
  "hub",
  "lab",
  "pro",
  "plus",
  "hq",
  "zone",
  "spot",
  "base",
  "works",
  "central",
];
const BRAND_SUFFIXES = ["ly", "ify", "er", "eo", "ix", "ia", "zy", "io"];
const SIMILARITY_SUFFIXES = [
  "hub",
  "lab",
  "ly",
  "er",
  "ify",
  "go",
  "to",
  "up",
  "me",
  "now",
];

function abbreviate(word: string): string[] {
  const abbrs: string[] = [];
  if (word.length >= 4) {
    abbrs.push(word.slice(0, 3));
    abbrs.push(word.slice(0, 4));
  }
  if (word.length >= 3) {
    abbrs.push(word.slice(0, 2) + word.slice(-1));
  }
  return [...new Set(abbrs)];
}

function mutate(word: string): string[] {
  const mutations: string[] = [word];
  // vowel swap
  const vowelMap: Record<string, string> = {
    a: "e",
    e: "i",
    i: "o",
    o: "u",
    u: "a",
  };
  let mutated = "";
  for (const ch of word) {
    mutated += vowelMap[ch] ?? ch;
  }
  if (mutated !== word) mutations.push(mutated);
  // double last consonant
  if (word.length >= 3 && !/[aeiou]$/.test(word)) {
    mutations.push(word + word[word.length - 1]);
  }
  return [...new Set(mutations)];
}

function generateFallbackNames(
  keyword: string,
  style: string,
  tlds: string[]
): string[] {
  const kw = keyword.toLowerCase().replace(/[^a-z0-9]/g, "");
  const names: Set<string> = new Set();

  if (style === "seo") {
    for (const suffix of SEO_SUFFIXES) {
      for (const tld of tlds) {
        names.add(`${kw}${suffix}.${tld}`);
      }
    }
    // Also prefix variations
    const prefixes = ["get", "my", "the", "go", "try"];
    for (const prefix of prefixes) {
      for (const tld of tlds) {
        names.add(`${prefix}${kw}.${tld}`);
      }
    }
  } else if (style === "brand") {
    const abbrs = abbreviate(kw);
    for (const abbr of abbrs) {
      for (const suffix of BRAND_SUFFIXES) {
        for (const tld of tlds) {
          names.add(`${abbr}${suffix}.${tld}`);
        }
      }
    }
    // Short creative names
    for (const suffix of BRAND_SUFFIXES) {
      for (const tld of tlds) {
        names.add(`${kw}${suffix}.${tld}`);
      }
    }
  } else {
    // similarity
    const variants = mutate(kw);
    for (const variant of variants) {
      for (const suffix of SIMILARITY_SUFFIXES) {
        for (const tld of tlds) {
          names.add(`${variant}${suffix}.${tld}`);
        }
      }
    }
    for (const tld of tlds) {
      names.add(`${kw}x.${tld}`);
      names.add(`${kw}z.${tld}`);
      names.add(`x${kw}.${tld}`);
    }
  }

  return Array.from(names).slice(0, 20);
}

// ---------- OpenAI integration ----------

async function generateWithOpenAI(
  keyword: string,
  style: string,
  tlds: string[]
): Promise<string[]> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return [];

  const styleDescriptions: Record<string, string> = {
    seo: "SEO-friendly names that include the keyword for discoverability",
    brand: "Short, creative, brandable names (can be made-up words)",
    similarity:
      "Names similar to popular existing domains/brands but unique and available",
  };

  const prompt = `Generate exactly 20 unique domain name ideas (just the name part, without TLD) based on the keyword "${keyword}".
Style: ${styleDescriptions[style] ?? styleDescriptions.seo}
Rules:
- Names should be lowercase, alphanumeric only (no hyphens)
- Names should be 4-15 characters long
- Return ONLY a JSON array of strings, nothing else
Example: ["coffeehub","brewspot","cafelabs"]`;

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
        temperature: 0.9,
        max_tokens: 500,
      }),
    });

    if (!res.ok) return [];

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content?.trim() ?? "";

    // Parse JSON array from response
    const match = content.match(/\[[\s\S]*\]/);
    if (!match) return [];

    const parsed = JSON.parse(match[0]) as string[];
    const cleaned = parsed
      .filter(
        (n: string) => typeof n === "string" && /^[a-z0-9]+$/.test(n)
      )
      .slice(0, 20);

    // Attach TLDs
    const domains: string[] = [];
    for (const name of cleaned) {
      for (const tld of tlds) {
        domains.push(`${name}.${tld}`);
      }
    }
    return domains.slice(0, 20);
  } catch {
    return [];
  }
}

// ---------- RDAP check ----------

async function checkAvailability(
  domain: string
): Promise<boolean | null> {
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

  const keyword = body.keyword?.trim().toLowerCase();
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
