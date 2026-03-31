---
description: SEO 블로그 글 작성 파이프라인. 키워드를 입력하면 분석→구조설계→작성→페이지생성→배포까지 자동 실행. 사용법: /write-blog [키워드]
---

# /write-blog 파이프라인

입력 키워드: $ARGUMENTS

아래 5단계를 순차적으로 실행한다. 각 단계에서 Agent 도구를 사용하여 서브에이전트를 호출한다.

---

## Step 1: 키워드 분석 + 콘텐츠 구조 설계

`blog-planner` 서브에이전트를 호출한다.

프롬프트:
```
키워드: $ARGUMENTS
프로젝트: domainchecker.co.kr (도메인 분석 SaaS)
기존 블로그: /mnt/d/Documents/domain_platform/web/src/lib/blog.ts 읽어서 기존 글 목록 확인

아래 항목을 분석하여 /tmp/blog-outline.md에 저장하세요:

1. 검색 의도 분석 (정보형/방법형/비교형/문제해결형)
2. 핵심 키워드 1개 + 서브 키워드 5~8개
3. 롱테일 키워드 3~5개
4. 추천 슬러그 (영문 kebab-case)
5. 추천 제목 (한국어, 60자 이내, "~하는 법/~란/~방법" 패턴)
6. 메타 설명 (150자 이내)
7. H2/H3 목차 구조 (각 섹션 목적 + 배치할 키워드 명시)
8. FAQ 5개 (질문 + 답변 2~3문장)
9. CTA (연결할 도구/페이지 + 버튼 텍스트)
10. 내부 링크 대상 3~5개 (기존 블로그/도구 URL)
11. 카테고리: "SEO 분석" | "도메인 투자" | "SEO 기초"
12. 예상 분량: N자 / N분 읽기
```

## Step 2: 사용자 확인

Step 1의 결과(아웃라인)를 /tmp/blog-outline.md에서 읽어서 사용자에게 보여준다.

요약 형태로 표시:
- 제목
- 슬러그
- 핵심 키워드
- 목차 구조
- FAQ 목록
- CTA 연결

사용자에게 질문: "이 구조로 진행할까요?"

**사용자가 승인하면 Step 3으로, 수정 요청하면 Step 1 재실행.**

## Step 3: 콘텐츠 작성

`seo-blog-writer` 서브에이전트를 호출한다.

프롬프트:
```
/tmp/blog-outline.md의 아웃라인을 읽고, 해당 구조에 맞춰 전체 본문을 작성하세요.
/mnt/d/Documents/domain_platform/.claude/agents/seo-blog-writer.md의 규칙을 따르세요.

중요 규칙:
- 분량: 3000~5000자
- 키워드 스터핑 금지
- 서드파티 API 이름(RapidAPI, VebAPI 등) 절대 노출 금지
- 도메인체커 도구는 자연스럽게 언급
- FAQ 답변은 각 2~3문장
- 실용적 예시/수치 포함

결과를 /tmp/blog-content.md에 저장하세요.
seo-blog-writer.md의 Output Format(## 본문 섹션)을 따르되, 마크다운 본문만 저장.
```

## Step 4: TSX 페이지 생성

`blog-builder` 서브에이전트를 호출한다.

프롬프트:
```
/tmp/blog-outline.md (아웃라인)과 /tmp/blog-content.md (본문)을 읽으세요.
/mnt/d/Documents/domain_platform/.claude/agents/blog-builder.md의 규칙을 따르세요.
/mnt/d/Documents/domain_platform/.claude/references/blog-style-guide.md도 참조하세요.

생성할 파일:
1. web/src/app/blog/{slug}/page.tsx
   - metadata export (title, description, keywords, openGraph)
   - BlogLayout 컴포넌트 사용 (src/components/blog/blog-layout.tsx)
   - props: slug, title, date(오늘), readTime, toc, faqs, cta
   - children: 본문 콘텐츠 (section > h2#id + 내용)

2. web/src/lib/blog.ts 수정
   - articles 배열 맨 위에 새 항목 추가

반드시 BlogLayout을 사용하세요. 인라인으로 TOC/관련글/CTA를 작성하지 마세요.
```

## Step 5: 빌드 + 커밋 + 푸시

Bash로 직접 실행:

```bash
cd /mnt/d/Documents/domain_platform/web && pnpm build 2>&1 | tail -10
```

빌드 성공 시:
```bash
git add web/src/app/blog/{slug}/page.tsx web/src/lib/blog.ts
git commit -m "feat: 블로그 — {제목 요약}

키워드: {핵심 키워드}
Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
git push origin master
```

빌드 실패 시: 에러 수정 후 재시도.

## 완료 보고

```
## 블로그 작성 완료

| 항목 | 내용 |
|------|------|
| 제목 | ... |
| URL | /blog/{slug} |
| 키워드 | ... |
| 분량 | N자 / N분 |
| FAQ | N개 |
| 카테고리 | ... |
```
