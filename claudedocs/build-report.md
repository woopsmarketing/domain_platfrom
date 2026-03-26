# Build Report

생성일시: 2026-03-26

## 요약

| 검증 | 결과 | 상세 |
|------|------|------|
| TypeScript | PASS | Next.js 빌드 내 tsc 통과 (오류 0개) |
| Next.js Build | PASS | 경고 1개 (edge runtime 정보성) |
| ESLint | SKIP | eslint 패키지 미설치 |

## 최종 판정: 배포 가능

## 빌드 상세

- Next.js 버전: 16.1.6 (Turbopack)
- 컴파일 시간: 14.4s
- 정적 페이지: 25개 (○)
- 동적 페이지: 18개 (ƒ)
- 전체 라우트: 43개

## 경고 사항

| 항목 | 내용 | 심각도 |
|------|------|--------|
| edge runtime 경고 | "Using edge runtime on a page currently disables static generation for that page" | INFO |

edge runtime 경고는 빌드 실패가 아닌 정보성 메시지입니다. 정적 생성이 비활성화된 페이지가 있음을 알리는 것으로, 동작에는 문제 없습니다.

## 라우트 현황

### 동적 렌더링 (ƒ)
- / (홈)
- /market-history
- /domain/[name]
- /auctions
- /auth/callback
- /api/* (전체 API 라우트)

### 정적 생성 (○)
- /blog, /blog/*
- /tools, /tools/*
- /login, /signup, /pricing
- /sitemap.xml, /robots.txt, /manifest.webmanifest

## 수정 권장 사항

1. **ESLint 설치 권장**: 코드 품질 유지를 위해 `pnpm add -D eslint eslint-config-next`를 `web/` 디렉토리에서 설치 권장
2. **edge runtime 검토**: edge runtime 사용 페이지가 정적 생성이 비활성화되는 것이 의도된 동작인지 확인 권장
