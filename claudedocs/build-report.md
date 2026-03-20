# Build Report

생성일: 2026-03-20

## 요약

| 검증 | 결과 | 상세 |
|------|------|------|
| TypeScript | PASS | 오류 0개 |
| Next.js Build | PASS | 경고 1개 (edge runtime 정적 생성 비활성화) |
| ESLint | WARN | 이슈 1개 (오류 1개, 경고 0개) |

## 최종 판정: 배포 가능 (ESLint 이슈 개선 권장)

빌드 자체는 성공했으나, ESLint에서 React 훅 관련 오류 1개가 감지되었습니다. 런타임 동작에는 지장이 없지만 성능 저하로 이어질 수 있어 개선을 권장합니다.

---

## 빌드 출력 (Next.js)

```
▲ Next.js 16.1.6 (Turbopack)
✓ Compiled successfully in 10.6s
✓ TypeScript 검사 완료
✓ 정적 페이지 14개 생성 완료

Route (app)
  ƒ /                           Dynamic
  ○ /_not-found                 Static
  ƒ /api/domain/[name]          Dynamic
  ƒ /api/domains                Dynamic
  ƒ /api/submissions/public     Dynamic
  ƒ /api/tld-stats              Dynamic
  ○ /blog                       Static
  ○ /blog/domain-auction-guide  Static
  ○ /blog/how-to-choose-domain  Static
  ○ /blog/what-is-da            Static
  ƒ /domain/[name]              Dynamic
  ƒ /domain/[name]/opengraph-image Dynamic
  ○ /icon.svg                   Static
  ○ /manifest.webmanifest       Static
  ƒ /market-history             Dynamic
  ƒ /opengraph-image            Dynamic
  ○ /robots.txt                 Static
  ○ /sitemap.xml                Static
  ○ /tools                      Static
```

빌드 경고: `Using edge runtime on a page currently disables static generation for that page`

---

## 발견된 이슈

| 파일 | 라인 | 오류 | 심각도 |
|------|------|------|--------|
| `src/components/domain/domain-quick-summary.tsx` | 47 | `react-hooks/set-state-in-effect` — useEffect 내부에서 setState를 동기 호출 | ERROR |

---

## 이슈 상세 분석

**파일**: `/mnt/d/Documents/domain_platform/web/src/components/domain/domain-quick-summary.tsx`

**문제 코드** (45~49번 라인):
```ts
useEffect(() => {
  let cancelled = false;
  setLoading(true);   // ← Effect 내 동기 setState 호출
  setError(null);     // ← Effect 내 동기 setState 호출
  setData(null);      // ← Effect 내 동기 setState 호출
```

**원인**: `useEffect` 본체에서 `setState`를 직접(동기) 호출하면 Effect 실행 → 렌더 → Effect 재실행의 연쇄 렌더링이 발생할 수 있습니다. ESLint `react-hooks/set-state-in-effect` 규칙이 이를 차단합니다.

---

## 수정 권장 사항

### 방법 1: 초기값 활용 (권장)

`useState` 초기값을 적절히 설정하고, Effect에서는 async 결과가 돌아왔을 때만 setState를 호출합니다.

```ts
// 변경 전
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);
const [data, setData] = useState<DomainDetail | null>(null);

useEffect(() => {
  let cancelled = false;
  setLoading(true);   // 제거
  setError(null);     // 제거
  setData(null);      // 제거
  ...
```

```ts
// 변경 후: domain prop이 바뀔 때 초기화를 useMemo/파생 상태로 처리
// 또는 useReducer로 상태 전환을 한 번에 묶기
const [state, dispatch] = useReducer(reducer, { loading: true, error: null, data: null });

useEffect(() => {
  let cancelled = false;
  dispatch({ type: "FETCH_START" });  // 단일 dispatch로 묶음
  ...
```

### 방법 2: ESLint 규칙 비활성화 (임시 대응, 비권장)

```ts
// eslint-disable-next-line react-hooks/set-state-in-effect
setLoading(true);
```

실제 동작 문제가 없다면 임시로 비활성화할 수 있지만, 성능 최적화 관점에서 방법 1을 권장합니다.

---

## 빌드 환경 정보

- Next.js: 16.1.6 (Turbopack)
- TypeScript: ^5
- Node.js: v20.20.1
- 패키지 매니저: pnpm
