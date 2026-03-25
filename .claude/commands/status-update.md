---
description: 코드베이스를 분석하고 CLAUDE.md, CURRENT_STATE.md, NEXT_TASK.md, RUNBOOK.md를 최신으로 업데이트한다. 사용법: /status-update
---

# /status-update 워크플로우

프로젝트의 현재 상태를 분석하고 문서를 최신으로 동기화한다.

## 실행 흐름

아래 순서로 반드시 실행한다.

### 1단계: codebase-analyzer 호출

`codebase-analyzer` 에이전트를 호출하여 전체 코드베이스를 분석한다.

전달할 내용:
- "프로젝트 전체를 분석하여 코드베이스 분석 리포트를 출력해라. 출력 형식을 반드시 따를 것."

분석 대상:
- 페이지, API 라우트, 컴포넌트, 크롤러 모듈의 실제 구현 상태
- 환경변수 설정 여부
- 최근 git 커밋 및 미커밋 변경사항
- 기존 문서(CLAUDE.md, CURRENT_STATE.md, NEXT_TASK.md, RUNBOOK.md)와 실제 코드의 차이점

### 2단계: status-doc-updater 호출

`status-doc-updater` 에이전트를 호출하여 문서를 업데이트한다.

전달할 내용:
- 1단계에서 받은 분석 리포트 전문
- "이 분석 리포트를 기반으로 CLAUDE.md, CURRENT_STATE.md, NEXT_TASK.md, RUNBOOK.md를 최신으로 업데이트해라."

### 3단계: 완료 보고

아래 형식으로 요약을 출력한다:

```
## /status-update 완료

| 문서 | 변경 여부 | 주요 변경 |
|------|----------|----------|
| CLAUDE.md | O/X | 요약 |
| CURRENT_STATE.md | O/X | 요약 |
| NEXT_TASK.md | O/X | 요약 |
| RUNBOOK.md | O/X | 요약 |

### 주요 발견사항
- 기존 문서와 실제 코드의 차이점 요약
- 새로 발견된 할 일
- 주의가 필요한 항목
```
