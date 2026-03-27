## 코드 리뷰: dashboard/* + api/dashboard/* + favorite-button.tsx

**검토 범위**: 16개 파일 (페이지 9개, API route 6개, 컴포넌트 1개)
**검토 일시**: 2026-03-27

---

### 빌드 상태
- tsc (`--noEmit`): PASS (오류 없음)
- build: 미실행 (tsc 통과, 구조적 문제 없음 확인)

---

### 발견 항목

| 심각도 | 파일:라인 | 문제 | 제안 |
|--------|----------|------|------|
| HIGH | `api/dashboard/inquiries/route.ts:20,25` | `broker_inquiries`, `inquiries` 테이블을 `user_id` 대신 `email`로 조회. 사용자가 이메일을 바꾸거나 OAuth 계정에 이메일 충돌이 생기면 다른 사용자 데이터가 노출될 수 있음. `auth.uid()`(RLS) 또는 별도 `user_id` 컬럼으로 연결 권장. | `broker_inquiries`, `inquiries` 테이블에 `user_id uuid REFERENCES auth.users` 컬럼 추가 후 `eq("user_id", user.id)`로 전환 |
| HIGH | `api/dashboard/stats/route.ts:18` | 위와 동일 — `broker_inquiries` 카운트를 `email`로 필터링. 빈 문자열(`""`)로 쿼리 시 의도치 않은 매칭 가능 (이메일이 null인 경우 `user.email ?? ""` → 빈 문자열 전달). | `user.email`이 null이면 0 반환하도록 얼리 리턴 처리 |
| HIGH | `dashboard/notifications/page.tsx:73` | `item.link`가 서버에서 내려온 임의 URL이며 검증 없이 `router.push(item.link)` 호출. 악성 관리자 또는 DB 오염 시 오픈 리다이렉트(open-redirect) 발생 가능. | `item.link`가 `/`로 시작하는 내부 경로인지 확인 후 push: `if (item.link?.startsWith("/")) router.push(item.link)` |
| HIGH | `dashboard/plan/page.tsx:81` | `/api/customer-portal` 응답의 `data.url`을 검증 없이 `window.open(data.url, "_blank")` 호출. API 응답이 오염될 경우 임의 URL 오픈. | `data.url`이 LemonSqueezy 도메인(`https://app.lemonsqueezy.com`)으로 시작하는지 서버에서 검증하거나, 클라이언트에서 도메인 prefix 확인 |
| MEDIUM | `dashboard/layout.tsx:32` | `React`를 import 하지 않고 `React.ReactNode` 타입을 사용. TypeScript 4.x에서는 허용(JSX 자동 변환)되고 tsc도 통과하나, 명시적 import 또는 `import type { ReactNode } from "react"` 사용이 권장 스타일. | `children: ReactNode` 로 `import type { ReactNode } from "react"` 추가 |
| MEDIUM | `dashboard/favorites/page.tsx:23-25` | `useEffect` 의존 배열이 `[]`인데 `fetchFavorites`가 컴포넌트 스코프 함수(의존성 미선언). `exhaustive-deps` eslint 규칙 위반. 동일 패턴이 `notifications/page.tsx:24-28`에도 존재. | `useCallback`으로 감싸거나 `useEffect` 내부로 함수를 이동 (history/page.tsx의 `fetchHistory` 패턴이 올바른 예시) |
| MEDIUM | `dashboard/favorites/page.tsx:41-54` | 삭제 버튼에 확인(confirm) 없이 즉시 삭제 실행. 실수로 클릭 시 복구 불가. | 삭제 전 `window.confirm` 또는 인라인 확인 UI 추가 |
| MEDIUM | `components/domain/favorite-button.tsx:24` | 즐겨찾기 체크를 위해 `/api/dashboard/favorites` 전체 목록을 fetch해서 클라이언트에서 find. 즐겨찾기가 많아질수록 불필요한 데이터 전송 발생. | `/api/dashboard/favorites/check?domain=example.com` 엔드포인트 분리 또는 기존 GET에 `?domain=` 파라미터 지원 추가 |
| MEDIUM | `api/dashboard/history/route.ts:14-15` | `parseInt`의 결과가 `NaN`일 경우 처리 없음 (`parseInt("abc", 10)` → `NaN`). `NaN - 1` 연산이 `NaN`을 생성해 Supabase `.range(NaN, NaN)` 호출로 이어짐. | `isNaN(page)` 체크 추가 또는 `const page = Math.max(1, parseInt(...) || 1)` 패턴 사용 |
| MEDIUM | `dashboard/settings/page.tsx:29-33` | `handleSignOut`에서 `await supabase.auth.signOut()`의 에러를 처리하지 않음. 로그아웃 실패 시에도 홈으로 리다이렉트됨. | try/catch 추가 후 실패 시 사용자에게 토스트 알림 |
| MEDIUM | `dashboard/plan/page.tsx:55-73` | 클라이언트 컴포넌트에서 직접 Supabase 클라이언트로 `subscriptions` 테이블 조회. 민감 구독 데이터(lemon_customer_id, cancel_at)를 클라이언트 SDK로 직접 노출. | `/api/dashboard/subscription` API route 생성 후 서버 사이드에서 반환 (service role 사용 통일) |
| MEDIUM | `dashboard/plan/page.tsx:83` | `alert()` 사용. 브라우저 기본 다이얼로그로 UX 불일치. | toast/sonner 등 프로젝트 통합 알림 컴포넌트 사용 |
| LOW | `dashboard/history/page.tsx:101` | key prop으로 `${item.id}-${item.searched_at}` 사용. `id`만으로 유일성이 보장된다면 불필요하게 복잡. | `key={item.id}` 단독 사용 |
| LOW | `dashboard/purchases/page.tsx:89` | `item.price_usd?.toLocaleString() ?? 0` — `price_usd`는 타입이 `number`로 선언되어 있어 optional chaining 불필요. 혼동 유발. | `item.price_usd.toLocaleString()` 으로 변경 |
| LOW | `dashboard/notifications/page.tsx` | `useRouter`를 import하지만 알림 클릭 시 내부 경로 이동에만 사용. `Link` 컴포넌트로 대체 가능한 케이스이나, 현재 `onClick` 로직(읽음 처리 + 이동)이 결합되어 있어 어쩔 수 없음 — 단, HIGH 항목의 open-redirect 수정 시 함께 정리 권장. | 수정 필요 없음 (HIGH 항목 수정과 연계) |
| LOW | 여러 페이지 | `} catch { // ignore }` 패턴이 16개 이상 존재. 네트워크 오류나 예외 발생 시 사용자에게 피드백이 전혀 없음. | 최소한 `console.error`라도 추가하거나, 전역 에러 상태 관리(toast) 도입 권장 |
| LOW | `api/dashboard/inquiries/route.ts` | `broker_inquiries` 조회 시 `name`, `email` 필드를 select하지만 클라이언트 타입(`InquiryItem`)에는 해당 필드가 없어 과다 데이터 전송. | select 절에서 클라이언트에서 사용하지 않는 `name`, `email` 필드 제거 |
| LOW | `dashboard/favorites/page.tsx`, `notifications/page.tsx` | `Check`, `X` 아이콘 버튼에 `aria-label`이 있으나, `Check`(저장 확인) 및 `X`(취소) 버튼에는 없음. | `aria-label="저장"`, `aria-label="취소"` 추가 |

---

### 요약

- **총 이슈**: 18개 (HIGH: 4, MEDIUM: 8, LOW: 6)

**즉시 수정 필요 (HIGH)**

1. `inquiries/route.ts` + `stats/route.ts` — email 기반 쿼리를 user_id 기반으로 전환 (데이터 격리 취약점)
2. `notifications/page.tsx:73` — 서버에서 내려온 `item.link`를 검증 없이 `router.push` 호출 (오픈 리다이렉트)
3. `plan/page.tsx:81` — `window.open(data.url)` 도메인 검증 누락

**개선 권장 (MEDIUM)**

- `favorites/page.tsx`, `notifications/page.tsx` — `useEffect` 의존 배열 누락 함수를 `useCallback`으로 래핑
- `history/route.ts` — `parseInt` NaN 방어 코드 추가
- `plan/page.tsx` — 클라이언트 직접 Supabase 쿼리 → API route 분리
- `favorite-button.tsx` — 전체 목록 fetch 대신 단건 체크 엔드포인트 사용

**전체적 긍정 평가**

- 모든 API route에 `createClient().auth.getUser()`로 인증 확인이 일관성 있게 구현됨
- DELETE/PATCH에 `.eq("user_id", user.id)` 조건이 추가되어 타 사용자 데이터 수정 방어 적절
- `dangerouslySetInnerHTML` 사용 없음
- `any` 타입 남용 없음
- tsc 통과 (타입 오류 없음)
- Supabase service role 클라이언트와 일반 클라이언트 역할 분리 적절

