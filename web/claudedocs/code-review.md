## 코드 리뷰: 전체 코드베이스 리팩토링 대상 분석

**검토 범위**: `src/app/api/dashboard/*.ts`, `src/app/dashboard/*.tsx`, `src/lib/*.ts`, `src/components/domain/*.tsx`, `src/app/api/*.ts`

---

### 빌드 상태

- tsc: 미실행 (읽기 전용 리뷰)
- build: 미실행 (읽기 전용 리뷰)

---

### 발견 항목

| 심각도 | 파일:라인 | 문제 | 제안 |
|--------|----------|------|------|
| **HIGH** | `src/app/api/sold-domains/route.ts:46–63` | Pro 구독 확인 로직이 `isProUser()`를 사용하지 않고 직접 subscriptions 테이블을 인라인 쿼리로 구현. `rate-limit.ts`의 `isProUser()`와 동일한 로직 중복 | `isProUser(request)` 호출로 대체 |
| **HIGH** | `src/components/domain/seo-metrics-cards.tsx:10`, `src/components/domain/pro-metric-lock.tsx:18,45` | `isPro()` — localStorage 기반의 구독 상태를 직접 읽음. `AuthProvider`가 실시간으로 Supabase에서 tier를 관리하는데 components는 localStorage 폴링 방식을 유지. SSR/hydration 시 불일치 가능성 있음 | `useAuth().tier`를 prop으로 내려받거나 `useAuth()` hook 사용 |
| **HIGH** | `src/lib/subscription.ts` 전체 | `isPro()`, `checkDailyLimit()`, `incrementDailyUsage()`가 localStorage 기반. `AuthProvider`의 Supabase tier 관리와 병렬로 존재. `auth-provider.tsx:82`에서 localStorage 동기화로 임시 호환을 맞추는 구조 — 두 시스템이 충돌하면 Free 사용자에게 Pro 권한 노출 또는 그 반대 상황 가능 | localStorage 기반 클라이언트 rate-limit은 제거하고 서버사이드 `checkApiRateLimit`으로 단일화. `isPro()` 함수는 `useAuth().tier === "pro"` 패턴으로 전환 |
| **MEDIUM** | `src/app/api/dashboard/favorites/route.ts:7–11`, `history/route.ts:7–11`, `notifications/route.ts:7–11`, `purchases/route.ts:7–11`, `inquiries/route.ts:7–11`, `stats/route.ts:7–11` | 모든 dashboard API에서 아래 패턴이 그대로 반복됨 (6개 파일 × 16줄): ```ts const supabase = await createClient(); const { data: { user } } = await supabase.auth.getUser(); if (!user) { return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 }); } const service = createServiceClient(); ``` | `src/lib/api-helpers.ts`에 `requireAuth()` 헬퍼 추출: ```ts export async function requireAuth() { const supabase = await createClient(); const { data: { user } } = await supabase.auth.getUser(); return user; } ``` |
| **MEDIUM** | `src/app/api/dns-lookup/route.ts:6–19`, `whois-lookup/route.ts:152–165`, `ssl-check/route.ts:7–20`, `http-status/route.ts:6–19`, `domain-availability/route.ts:78–91`, `domain-generator/route.ts:229–242`, `domain/[name]/route.ts:15–28` | Rate limit 체크 블록 7곳에서 완전히 동일한 14줄 패턴 반복: ```ts const pro = await isProUser(request); if (!pro) { const rateLimit = await checkApiRateLimit("key", N); if (!rateLimit.allowed) { return NextResponse.json({ error: "일일 사용 한도를...", limit, used }, { status: 429 }); } } ``` | `src/lib/rate-limit.ts`에 헬퍼 추가: ```ts export async function withRateLimit( request: NextRequest, toolKey: string, dailyLimit: number ): Promise<NextResponse | null> ``` null이면 통과, NextResponse이면 429 반환 |
| **MEDIUM** | `src/app/dashboard/settings/page.tsx:10–16`, `src/app/dashboard/plan/page.tsx:19–25`, `src/app/account/page.tsx:19–26`, `src/app/blog/page.tsx:20–24`, `src/components/tools/ssl-checker-client.tsx:20–23`, `src/components/tools/whois-lookup-client.tsx:21–26`, `src/components/tools/domain-expiry-client.tsx:22–25` | `formatDate(dateStr)` 함수가 7개 파일에서 각자 로컬로 정의됨. `src/lib/utils.ts:23`에 `formatDate`가 이미 존재하나 시그니처 불일치(`string | Date` vs `string | null`)로 재사용 안 됨 | `src/lib/utils.ts`의 `formatDate`를 `(date: string \| Date \| null \| undefined, options?: Intl.DateTimeFormatOptions): string`으로 통일하고 7개 파일에서 로컬 함수 제거 |
| **MEDIUM** | `src/app/dashboard/plan/page.tsx:27–38`, `src/app/account/page.tsx:34–54` | `PRO_FEATURES`, `FREE_LIMITS` 상수가 두 파일에서 중복 정의 (내용 동일, 구조만 약간 다름 — plan.tsx는 `string[]`, account.tsx는 `{text, pro}[]`) | `src/lib/plan-features.ts` 또는 `src/constants/plan.ts`로 추출하여 두 페이지에서 import |
| **MEDIUM** | `src/app/api/admin/inquiries/route.ts:7–17`, `src/app/api/admin/listings/route.ts:7–17` | `verifyAdmin()` 함수가 두 파일에 동일하게 복사됨. `ADMIN_USER_ID` 읽기 + `createClient()` 인증까지 14줄 완전 중복 | `src/lib/api-helpers.ts` 또는 `src/lib/admin.ts`에 공통 추출 |
| **MEDIUM** | `src/lib/subscription.ts:39`, `src/lib/subscription.ts:49`, `src/lib/rate-limit.ts:22` | KST 날짜 계산 `new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10)` 3곳 중복. 매직 넘버 `9 * 60 * 60 * 1000` | `src/lib/utils.ts`에 `getTodayKST(): string` 유틸 추출 |
| **MEDIUM** | `src/app/api/dashboard/inquiries/route.ts:46–48`, `src/app/api/admin/inquiries/route.ts:38–52` | 두 곳에서 `brokerItems`와 `inquiryItems`를 합쳐 날짜순 정렬하는 패턴 중복. 구현 방식은 동일하나 필드명 소폭 차이 | 정렬 유틸 `sortByCreatedAt<T extends {created_at: string}>(arr: T[]): T[]` 추출 |
| **MEDIUM** | `src/app/dashboard/purchases/page.tsx:31–46` | `useEffect` 내부 `fetchPurchases` 함수가 `useCallback` 없이 정의됨. `page.tsx:32–47`의 `fetchInquiries`도 동일. `favorites/page.tsx`는 `useCallback`을 올바르게 사용. 일관성 없음 | `useCallback` 패턴으로 통일 또는 커스텀 훅 `useDashboardFetch` 추출 |
| **MEDIUM** | `src/lib/db/domains.ts:64–71` | `getDomains()`의 `tab` 파라미터 분기 (`recent` / `highvalue` / `all`)에서 세 경우 모두 동일한 쿼리 실행 (`.eq("status", "sold").order("created_at", { ascending: false })`). `highvalue` 필터링은 클라이언트사이드 후처리 (`line 105–107`). 주석에도 "will be done client-side" 명시 | DB 레벨에서 `highvalue` 필터(`price_usd >= 500`) 를 `sales_history` JOIN 조건으로 처리하거나, 최소한 dead branch 제거 |
| **MEDIUM** | `src/app/api/domain/[name]/route.ts:67–79` | 검색 이력 기록 시 `import("@/lib/supabase/server")`와 `import("@/lib/supabase")`를 동적 import로 처리. "순환 참조 방지"라는 주석이 있으나 파일 최상단에 이미 `createClient`를 import해도 순환 없음 — 불필요한 동적 import | 정적 import로 변경 |
| **LOW** | `src/app/api/dashboard/notifications/route.ts:1` | `import { NextRequest, NextResponse }` — `GET` 함수에서는 `NextRequest`를 사용하지 않음 (`GET()` 파라미터 없음). 미사용 import | `NextRequest` 제거 |
| **LOW** | `src/lib/cache.ts:1` | 주석 "14-day cache TTL"이지만 변수명은 `CACHE_TTL_MS`, CLAUDE.md 문서에는 "7일 캐시"로 명시. 실제 값은 14일 (`14 * 24 * 60 * 60 * 1000`). 문서/코드/주석 불일치 | 값 재확인 후 통일. 7일이 정책이라면 `7 * 24 * 60 * 60 * 1000`으로 수정 |
| **LOW** | `src/lib/subscription.ts:8–21` | `getSubscriptionTier()`, `setSubscriptionTier()` 함수가 export되어 있으나 `src/components/dev/pro-toggle.tsx`에서만 사용됨. `isPro()` 함수도 서버와 클라이언트 혼재 사용 중 | 개발용 toggle 전용임을 명확히 하고, `pro-toggle.tsx`로 이동하거나 `// dev-only` 주석 명시 |
| **LOW** | `src/lib/email.ts:27` | `process.env.BREVO_SENDER_EMAIL \|\| "vnfm0580@gmail.com"` — 실제 이메일 하드코딩 | 환경변수 미설정 시 빈 문자열로 처리하거나 필수값으로 처리. 개인 이메일 노출 제거 |
| **LOW** | `src/components/domain/pro-metric-lock.tsx:42–47` | `proValue()` 함수에서 `"__pro_locked__" as unknown as undefined` — 타입 단언 남용. 반환 타입이 `number \| string \| null \| undefined`인데 실제로 sentinel 문자열을 반환 | 반환 타입을 `number \| string \| null \| undefined \| "__pro_locked__"` 으로 명시하거나 전용 타입 사용 |
| **LOW** | `src/app/dashboard/history/page.tsx:107–113`, `src/app/dashboard/notifications/page.tsx:125–131` | `toLocaleDateString("ko-KR", { year, month, day, hour, minute })` 옵션 객체가 두 곳에서 동일하게 반복됨 | `src/lib/utils.ts`에 `formatDateTime()` 추가 |
| **LOW** | `src/lib/domain-utils.ts:95–101` | `GRADE_BG_MAP` 상수가 export되어 있으나 프로젝트 내 사용처를 찾을 수 없음 (dead export) | 사용처 확인 후 미사용이면 제거 |

---

### 요약

- **총 이슈: 19개** (HIGH: 3, MEDIUM: 12, LOW: 4)

#### 즉시 수정 필요 (HIGH)

1. **`sold-domains/route.ts`**: `isProUser()` 인라인 중복 구현 — 서버 사이드 Pro 판단 로직이 분기됨
2. **`seo-metrics-cards.tsx`, `pro-metric-lock.tsx`**: `isPro()` localStorage 직접 호출 — `useAuth()`와 이중 관리로 edge case 시 권한 불일치 가능
3. **`subscription.ts` 이중 시스템**: localStorage 기반 클라이언트 rate-limit과 Supabase 기반 서버 rate-limit 혼재

#### 개선 권장 (MEDIUM 최우선)

1. **`requireAuth()` 헬퍼 추출** — dashboard API 6개 파일에서 16줄 패턴 제거 (즉각적인 코드 감소 효과)
2. **`withRateLimit()` 헬퍼 추출** — 도구 API 7개 파일에서 14줄 패턴 제거
3. **`formatDate()` 통일** — `src/lib/utils.ts` 단일 구현으로 7개 파일 로컬 정의 제거
4. **`PRO_FEATURES` / `FREE_LIMITS` 상수 중앙화** — plan 변경 시 한 곳만 수정
5. **`verifyAdmin()` 중복 제거** — admin API 공통 헬퍼로 추출
6. **`getTodayKST()` 유틸 추출** — 매직 넘버 제거

---

### 리팩토링 우선순위 제안

```
Phase 1 (안정성): HIGH 3개 처리
  └─ subscription.ts 이중 시스템 단일화
  └─ sold-domains isProUser 인라인 제거
  └─ seo-metrics-cards useAuth() 전환

Phase 2 (코드 감소): requireAuth + withRateLimit 헬퍼 추출
  └─ dashboard API 6개 파일 → 헬퍼 적용
  └─ 도구 API 7개 파일 → 헬퍼 적용

Phase 3 (일관성): formatDate 통일 + 상수 중앙화
  └─ utils.ts formatDate 시그니처 통일
  └─ plan constants 추출
  └─ getTodayKST 추출
```
