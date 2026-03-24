# Build Report

생성 일시: 2026-03-24

## 요약

| 검증 | 결과 | 상세 |
|------|------|------|
| TypeScript | PASS | Next.js 빌드 내 tsc 통과 (별도 실행 불가 — typescript devDependency 미설치) |
| Next.js Build | PASS | 경고 1개 (edge runtime static generation 비활성화) |
| ESLint | WARN/ERROR | 오류 1개, 경고 5개 |

## 최종 판정: 배포 가능 (단, ESLint 오류 개선 권장)

> Next.js 빌드 자체는 성공. ESLint 오류는 빌드를 막지 않지만 런타임 성능에 영향 가능.

---

## 발견된 이슈

| 파일 | 라인 | 오류 | 심각도 |
|------|------|------|--------|
| `src/components/domain/domain-quick-summary.tsx` | 47 | `useEffect` 내부에서 `setState` 동기 호출 — 캐스케이딩 렌더 유발 | ERROR |
| `src/app/api/active-auctions/route.ts` | 149 | `request` 변수 선언 후 미사용 | WARNING |
| `src/app/layout.tsx` | 67 | GTM 인라인 스크립트 대신 `@next/third-parties/google` `GoogleTagManager` 컴포넌트 권장 | WARNING |
| `src/components/domain/domain-table.tsx` | 4 | `Badge` import 미사용 | WARNING |
| `src/components/domain/domain-table.tsx` | 23 | `statusVariant` 변수 선언 후 미사용 | WARNING |
| `src/components/domain/domain-table.tsx` | 29 | `statusLabel` 변수 선언 후 미사용 | WARNING |

---

## 빌드 결과 상세

### Next.js Build
- 컴파일: 8.6s (Turbopack)
- 정적 페이지: 23개 생성 완료
- 동적 라우트(ƒ): 11개
- 경고: edge runtime 사용 페이지 1개에서 static generation 비활성화

### 라우트 목록 (정상 생성)
```
/ (Dynamic)
/blog, /blog/* (Static)
/tools, /tools/* (Static)
/auctions (Dynamic)
/domain/[name] (Dynamic)
/market-history (Static)
/api/* (Dynamic)
```

---

## 수정 권장 사항

### 1. [ERROR] domain-quick-summary.tsx:47 — useEffect 내 setState 동기 호출

**문제**: `useEffect` 본문에서 `setLoading(true)`, `setError(null)`, `setData(null)`을 동기적으로 호출하면 React가 렌더를 연속 트리거함.

**수정 방향**:
- `useEffect` 시작 시 상태를 한 번에 묶어서 `useReducer`로 처리하거나
- 초기값을 `useState`의 초기 상태로 지정하고, effect 내에서는 최종 결과만 setState 호출
- 또는 단순히 린트 규칙을 이해하고 현재 패턴이 실제로 문제없는 경우 `// eslint-disable-next-line` 주석으로 억제 (권장하지 않음)

```ts
// 개선 예시: useReducer로 상태 묶기
type State = { data: DomainDetail | null; loading: boolean; error: string | null };
type Action =
  | { type: 'loading' }
  | { type: 'success'; payload: DomainDetail }
  | { type: 'error'; payload: string };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'loading': return { data: null, loading: true, error: null };
    case 'success': return { data: action.payload, loading: false, error: null };
    case 'error': return { data: null, loading: false, error: action.payload };
  }
}
```

### 2. [WARNING] active-auctions/route.ts:149 — 미사용 `request` 파라미터

**수정 방향**: 함수 시그니처에서 `request` 파라미터를 제거하거나 `_request`로 이름 변경.

### 3. [WARNING] layout.tsx:67 — GTM 인라인 스크립트

**수정 방향**: `@next/third-parties/google`의 `GoogleTagManager` 컴포넌트로 교체.
```ts
import { GoogleTagManager } from '@next/third-parties/google';
// <GoogleTagManager gtmId="GTM-XXXXXX" />
```

### 4. [WARNING] domain-table.tsx — 미사용 변수/import 3개

**수정 방향**: `Badge` import, `statusVariant`, `statusLabel` 변수 삭제.

---

## 결론

- Next.js 빌드: **성공** — 즉시 배포 가능
- TypeScript: **통과** (빌드 시 검증 완료)
- ESLint: **오류 1개** — 배포를 막지 않으나 성능 개선을 위해 수정 권장
