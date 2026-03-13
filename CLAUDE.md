# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Project Is

**Domain Platform**은 경매 도메인 및 만료 도메인 정보 집약 플랫폼이다.
GoDaddy, Namecheap 등 도메인 기관의 경매·만료 도메인을 수집하고, 각 도메인의 SEO 지수(DA, PA, DR, TF, CF 등)와 과거 낙찰 이력을 제공한다. 도메인 투자자와 SEO 전문가가 타겟이다.

> 상세 요구사항 → [`docs/PRD.md`](docs/PRD.md)

## Tech Stack

| 레이어 | 기술 |
|---|---|
| Frontend | Next.js App Router + TypeScript + Tailwind CSS |
| Package manager | pnpm |
| DB | PostgreSQL |
| 캐싱 | Redis (RapidAPI 응답 캐싱) |
| 배포 | Vercel |
| 도메인 지수 API | RapidAPI `domain-metrics-check` |

## Key External API

```
GET https://domain-metrics-check.p.rapidapi.com/domain-metrics/{domain}
Headers:
  X-RapidAPI-Key: {RAPIDAPI_KEY}        # .env에 보관
  X-RapidAPI-Host: domain-metrics-check.p.rapidapi.com
```

반환 지수: `mozDA`, `mozPA`, `ahrefsDR`, `majesticTF`, `majesticCF`, `ahrefsTraffic`, `ahrefsBacklinks` 등.
API 한도: 무료 플랜 15,000 req/월 → DB 캐싱 필수 (갱신 주기 7–14일 배치)

## Project Layout

```
.claude/
├── agents/          # 23 specialized sub-agent definitions (.md files with YAML frontmatter)
├── skills/          # 6 skill frameworks (each is a self-contained directory with SKILL.md)
└── scripts/         # Utility scripts (Python/Bash)
```

## Core Concepts

### Sub-agents (`.claude/agents/`)
Each `.md` file defines a specialized Claude instance. The YAML frontmatter controls behavior:
```yaml
---
name: agent-name
description: When/why to invoke this agent (drives auto-delegation)
tools: Read, Grep, Bash       # Optional — restricts available tools
model: sonnet|opus|haiku      # Optional
permissionMode: default|acceptEdits|bypassPermissions|plan
skills: skill1, skill2        # Auto-loaded skill context
---
System prompt content...
```

The `description` field is critical — it determines when Claude auto-delegates to this agent.

### Skills (`.claude/skills/`)
Skills are modular knowledge packages. Each skill directory contains:
```
skill-name/
├── SKILL.md              # Required: YAML frontmatter + instructions
├── scripts/              # Executable Python/Bash utilities
├── references/           # Domain documentation (loaded on demand)
└── assets/               # Templates, fonts, etc.
```

SKILL.md uses a **progressive disclosure** pattern: frontmatter is always loaded, body loads on trigger, referenced resources load on demand.

## Skill-Specific Commands

### `vercel-react-best-practices`
```bash
pnpm build           # Build the skill bundle
pnpm validate        # Validate rules
pnpm extract-tests   # Extract test cases from rules
```

### `youtube-collector`
```bash
python3 scripts/setup_api_key.py     # Configure YouTube API key
python3 scripts/collect_videos.py    # Collect videos from a channel
```

### `skill-creator`
```bash
python3 scripts/init_skill.py        # Scaffold a new skill
python3 scripts/package_skill.py     # Package skill for distribution
```

## Architecture Patterns

### Technology Assumptions in Agents
The agents assume a specific target stack for projects they assist with:
- **Frontend**: Next.js App Router + TypeScript, Tailwind CSS
- **Animations**: `motion/react` (requires `"use client"`)
- **Icons**: `lucide-react`
- **Package manager**: `pnpm`
- **Deployment**: Vercel

### Output Convention
Agent outputs (analysis reports, specs, architecture docs) are saved to a `claudedocs/` directory in the target project root.

### Agent Categories
| Category | Agents |
|---|---|
| Architecture & Design | `architect`, `api-designer`, `api-route-builder`, `style-engineer` |
| Code Quality | `code-reviewer`, `test-writer`, `build-validator`, `error-diagnoser`, `security-auditor` |
| UI/UX | `form-builder`, `landing-section-builder`, `mobile-layout-checker`, `ux-copy-reviewer` |
| Analysis | `prd-analyzer`, `brand-logo-finder`, `bundle-analyzer`, `user-exit-analyzer` |
| Deployment | `vercel-deploy-debugger`, `env-checker`, `api-key-guard` |
| Content | `copy-writer`, `image-optimizer` |

## Creating New Components

### New Sub-agent
Use the `subagent-creator` skill. Key rules:
- Keep `description` concise and trigger-specific (used for auto-delegation matching)
- Only list tools the agent actually needs
- Place the file in `.claude/agents/<name>.md`

### New Skill
Use the `skill-creator` skill. Key rules:
- SKILL.md frontmatter must include `name` and `description`
- Scripts go in `skills/<name>/scripts/`, references in `skills/<name>/references/`
- Reference external docs inline in SKILL.md body rather than duplicating them

### New Hook
Use the `hook-creator` skill. See `.claude/skills/hook-creator/references/hook-events.md` for available lifecycle events.

### New Slash Command
Use the `slash-command-creator` skill for custom `/command` shortcuts.
