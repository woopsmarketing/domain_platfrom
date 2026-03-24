# Build Report

생성 일시: 2026-03-24

## 요약

| 검증 | 결과 | 상세 |
|------|------|------|
| TypeScript | PASS | 오류 0개 |
| Next.js Build | PASS | 경고 1개 (edge runtime 정적 생성 비활성화) |
| ESLint | WARN | 오류 1개, 경고 5개 |

## 최종 판정: 배포 가능

> 빌드 자체는 성공. ESLint 오류(react-hooks/set-state-in-effect)는 런타임 버그가 아닌 성능 경고로 배포는 가능하나 개선 권장.

---

## 빌드 결과 상세

### Next.js 빌드 라우트 현황 (29개 라우트)

| 타입 | 라우트 수 |
|------|----------|
| Static (○) | 18개 |
| Dynamic (ƒ) | 11개 |

**빌드 경고**: `Using edge runtime on a page currently disables static generation for that page`
- 해당 라우트: `/api/active-auctions` (edge runtime 사용)

---

## 발견된 이슈

| 파일 | 라인 | 오류 | 심각도 |
|------|------|------|--------|
| `src/components/domain/domain-quick-summary.tsx` | 47 | `react-hooks/set-state-in-effect` — useEffect 내 동기 setState 호출 | ERROR |
| `src/app/api/active-auctions/route.ts` | 149 | `'request' is defined but never used` | WARN |
| `src/app/layout.tsx` | 67 | GTM 인라인 스크립트 대신 `GoogleTagManager` 컴포넌트 사용 권장 | WARN |
| `src/components/domain/domain-table.tsx` | 4 | `'Badge'` 미사용 import | WARN |
| `src/components/domain/domain-table.tsx` | 23 | `'statusVariant'` 할당 후 미사용 | WARN |
| `src/components/domain/domain-table.tsx` | 29 | `'statusLabel'` 할당 후 미사용 | WARN |

---

## 수정 권장 사항

### 1. [ERROR] domain-quick-summary.tsx — useEffect 내 동기 setState

**파일**: `src/components/domain/domain-quick-summary.tsx` (라인 47-49)

**원인**: `useEffect` body에서 `setLoading(true)`, `setError(null)`, `setData(null)`을 동기적으로 호출하면 렌더링 cascade가 발생할 수 있음.

**수정 방향**:
- `setLoading(true)`를 초기 state 선언(`useState(true)`)으로 이동
- 또는 세 setState를 `useReducer`로 묶어 단일 dispatch로 처리
- fetch 시작 시 상태 초기화는 아래처럼 분리 가능:
  ```ts
  // 방법 1: 초기값을 true로 선언
  const [loading, setLoading] = useState(true);
  // useEffect 내 setLoading(true) 제거 후, dependency 변경 시 자연스럽게 처리

  // 방법 2: useReducer 사용으로 단일 dispatch
  dispatch({ type: 'FETCH_START' }); // loading:true, error:null, data:null 동시 처리
  ```

### 2. [WARN] active-auctions/route.ts — 미사용 파라미터

**파일**: `src/app/api/active-auctions/route.ts` (라인 149)

**수정 방향**: `request` 파라미터를 사용하지 않는다면 `_request`로 이름 변경하거나 파라미터 제거.

### 3. [WARN] layout.tsx — GTM 컴포넌트 사용 권장

**파일**: `src/app/layout.tsx` (라인 67)

**수정 방향**: `@next/third-parties/google`의 `GoogleTagManager` 컴포넌트로 교체하면 성능 최적화 및 lint 경고 해소. 단, 기능상 문제는 없음.

### 4. [WARN] domain-table.tsx — 미사용 변수/import 정리

**파일**: `src/components/domain/domain-table.tsx` (라인 4, 23, 29)

**수정 방향**: `Badge` import, `statusVariant`, `statusLabel` 변수 제거 또는 실제 사용 추가.

