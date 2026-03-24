# Build Report
생성일: 2026-03-24

## 요약
| 검증 | 결과 | 상세 |
|------|------|------|
| TypeScript | PASS | Next.js 빌드 내 타입 체크 통과 (별도 tsc 바이너리 미설치) |
| Next.js Build | PASS | 경고 1개 (edge runtime 정적 생성 비활성화) |
| ESLint | WARN | 오류 2개 (lint 오류는 빌드 차단 안 됨), 경고 5개 |

## 최종 판정: 배포 가능

> Next.js 빌드 자체는 성공. ESLint 오류 2개는 빌드를 차단하지 않으나, 런타임 버그 또는 성능 문제로 이어질 수 있으므로 개선 권장.

---

## 발견된 이슈

### ESLint 오류 (2개) — 빌드 미차단, 개선 권장
| 파일 | 라인 | 오류 | 심각도 |
|------|------|------|--------|
| `src/app/market-history/page.tsx` | 39 | `Date.now` 는 렌더 중 호출 불가한 impure 함수 | ERROR |
| `src/components/domain/domain-quick-summary.tsx` | 47 | `useEffect` 내에서 `setState` 동기 호출 — 캐스케이딩 렌더 유발 | ERROR |

### ESLint 경고 (5개)
| 파일 | 라인 | 경고 | 심각도 |
|------|------|------|--------|
| `src/app/api/active-auctions/route.ts` | 149 | `request` 변수 선언 후 미사용 | WARNING |
| `src/app/layout.tsx` | 67 | GTM 인라인 스크립트 대신 `@next/third-parties` GoogleTagManager 컴포넌트 권장 | WARNING |
| `src/components/domain/domain-table.tsx` | 4 | `Badge` import 후 미사용 | WARNING |
| `src/components/domain/domain-table.tsx` | 23 | `statusVariant` 할당 후 미사용 | WARNING |
| `src/components/domain/domain-table.tsx` | 29 | `statusLabel` 할당 후 미사용 | WARNING |

### Next.js 빌드 경고 (1개)
| 대상 | 내용 | 심각도 |
|------|------|--------|
| edge runtime 사용 페이지 | `Using edge runtime on a page currently disables static generation` | WARNING |

---

## 수정 권장 사항

### 1. `market-history/page.tsx` — Date.now impure 함수 (line 39)
**문제**: 서버 컴포넌트 렌더 중 `Date.now()` 직접 호출 → 재렌더마다 다른 결과 반환 위험.
**수정 방향**: 함수 외부(모듈 레벨) 또는 `useMemo` / 서버 액션으로 이동. 서버 컴포넌트라면 `async` 함수 최상단에서 변수로 추출한 뒤 DB 쿼리에 전달.

### 2. `domain-quick-summary.tsx` — useEffect 내 setState 동기 호출 (line 47)
**문제**: `useEffect` 진입 즉시 `setLoading(true)` 동기 호출 → 마운트 직후 추가 렌더 발생.
**수정 방향**: `useState` 초기값을 `true`로 설정하여 `setLoading(true)` 호출 제거. 또는 `useReducer`로 초기 상태를 `{ loading: true, error: null, data: null }`로 통합 관리.

### 3. `domain-table.tsx` — 미사용 import/변수 (line 4, 23, 29)
**수정 방향**: `Badge` import 제거, `statusVariant` / `statusLabel` 변수 제거 또는 실제 UI에 적용.

### 4. `active-auctions/route.ts` — 미사용 매개변수 (line 149)
**수정 방향**: `request` → `_request`로 이름 변경 (미사용 의도 명시 컨벤션).

### 5. `layout.tsx` — GTM 인라인 스크립트 (line 67)
**수정 방향**: 현재 동작에는 영향 없음. 장기적으로 `@next/third-parties/google`의 `GoogleTagManager` 컴포넌트로 교체 권장.
