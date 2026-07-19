# Agent Rules

Enforceable standards derived from [`docs/phase-2-engineering-practices.md`](../docs/phase-2-engineering-practices.md). Validated against real tasks in [`rule-validation.md`](./rule-validation.md).

## Rule index

| File | Scope | Read when editing |
|------|-------|-------------------|
| [00-global-conventions.md](./00-global-conventions.md) | All changes | Any file — start here |
| [01-api-and-module-boundaries.md](./01-api-and-module-boundaries.md) | API design, data flow, refactors | Routes, fetch logic, new dashboard features |
| [02-backend-fastapi.md](./02-backend-fastapi.md) | `backend/**` | Python routes, models, tests, deps |
| [03-frontend-dashboard.md](./03-frontend-dashboard.md) | `frontend/**` | Components, charts, Vite config |
| [04-testing.md](./04-testing.md) | Test files | New behavior, bug fixes |
| [05-docker-and-dependencies.md](./05-docker-and-dependencies.md) | Docker, env, CORS | Compose, Dockerfiles, `requirements.txt` |

## Selection guide

```
File(s) being edited          → Rules to read
──────────────────────────────────────────────
backend/app/routes.py         → 00, 01, 02, 04
frontend/src/App.tsx          → 00, 01, 03, 04
frontend/src/components/**    → 00, 03, 04
docker-compose.yml            → 00, 05
requirements.txt              → 02, 05
```

Also read `AGENTS.md` and Phase 1 summary in `composer-review.md` for project context.

## Rule file format

Each rule contains: **Scope**, **Rationale**, **Requirements** (MUST / SHOULD / MUST NOT), **Repository anchors**, **Task examples**.

Use [RULE-TEMPLATE.md](./RULE-TEMPLATE.md) when adding rules. Extend [rule-validation.md](./rule-validation.md) with a new task walkthrough.

## Phase boundaries

| Phase | Deliverable | Location |
|-------|-------------|----------|
| 1 | Project summary | `composer-review.md` |
| 2 | Practices analysis + proposed rules | `docs/phase-2-engineering-practices.md` |
| 3 | Rule implementation + validation | `.agents/rules/` (this directory) |
| 4 | Project memory bank | `memory-bank/` — not created yet |
