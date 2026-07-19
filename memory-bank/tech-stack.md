# Tech Stack

**Last updated:** July 19, 2026  
**Evidence sources:** `frontend/package.json`, `backend/requirements.txt`, `docker-compose.yml`, Dockerfiles, config files

---

## Overview

| Layer | Technology | Version / notes |
|-------|------------|-----------------|
| Frontend | React + TypeScript | React 19.2, TypeScript ~6.0 (`package.json`) |
| Backend | FastAPI + Python | Python 3.13 slim image (`backend/Dockerfile`) |
| Data | In-memory mock | No database |
| Dev runtime | Docker Compose | Two services: frontend + backend |
| Tests | Vitest + pytest | 5 frontend util tests, 15 backend route tests |

---

## Frontend

### Core

| Tool | Version | Evidence |
|------|---------|----------|
| React | ^19.2.4 | `package.json` |
| TypeScript | ~6.0.2 | `package.json` |
| Vite | ^8.0.4 | `package.json`, `vite.config.ts` |
| Tailwind CSS | ^4.2.2 | `@tailwindcss/vite` plugin |
| Recharts | ^3.8.1 | Chart components in `components/dashboard/` |
| lucide-react | ^1.8.0 | Icons |

### UI utilities

| Package | Purpose |
|---------|---------|
| `clsx` + `tailwind-merge` | Conditional classes via `cn()` in `lib/utils.ts` |
| `class-variance-authority` | shadcn-style component variants (`components.json`) |

### Build and quality

| Script | Command | Evidence |
|--------|---------|----------|
| Dev server | `npm run dev` | Vite on port 5173 |
| Production build | `npm run build` | `tsc -b && vite build` |
| Lint | `npm run lint` | ESLint 9 |
| Test | `npm test` | Vitest 4 |
| Coverage | `npm run test:coverage` | `@vitest/coverage-v8` |

### Configuration files

| File | Role |
|------|------|
| `vite.config.ts` | React plugin, Tailwind, `@/` alias, `/api` proxy |
| `tsconfig.app.json` / `tsconfig.node.json` | TypeScript project references |
| `eslint.config.js` | ESLint flat config |
| `frontend/.env.example` | Optional `VITE_API_BASE_URL` |
| `components.json` | shadcn/ui configuration |

### Docker (frontend)

- **Image:** `node:24-alpine` (`frontend/Dockerfile`)
- **Command:** Vite dev server on `0.0.0.0:5173`
- **Note:** Dev-only; no production nginx/static stage

---

## Backend

### Core

| Tool | Evidence |
|------|----------|
| FastAPI | `backend/app/main.py` |
| Uvicorn | `uvicorn[standard]` in `requirements.txt`; `--reload` in Dockerfile CMD |
| Pydantic | Models inline in `routes.py` |
| debugpy | Port 5678 exposed; started in Dockerfile CMD |

### Python dependencies

From `backend/requirements.txt` (unpinned versions):

```
fastapi
uvicorn[standard]
debugpy
pytest
pytest-cov
httpx
```

`httpx` supports FastAPI `TestClient`. `pytest-cov` is listed but no coverage threshold is configured.

### Application structure

```text
backend/
├── app/
│   ├── main.py      # FastAPI app, CORS, router mount
│   └── routes.py    # Models, mock data, helpers, all routes (~390 lines)
├── tests/
│   ├── conftest.py
│   └── test_routes.py   # 15 test functions
├── Dockerfile
└── requirements.txt
```

### Docker (backend)

- **Image:** `python:3.13-slim`
- **Ports:** 8000 (API), 5678 (debugpy)
- **Command:** debugpy + uvicorn with `--reload`
- **Note:** Dev-only configuration

---

## Infrastructure and tooling

### Docker Compose

File: `docker-compose.yml`

| Service | Port(s) | Volumes |
|---------|---------|---------|
| `frontend` | 5173 | Bind mount `./frontend:/app`; anonymous `/app/node_modules` |
| `backend` | 8000, 5678 | Bind mount `./backend:/app` |

- `frontend` `depends_on: backend` (no healthcheck today)
- Primary startup: `docker compose up --build` (`README.md`)

### Git and environment

| Item | Detail |
|------|--------|
| `.gitignore` | Excludes `.env*`, `node_modules`, Python caches, coverage artifacts |
| Secrets | No `.env` committed; template at `frontend/.env.example` |
| CI/CD | No GitHub Actions or pre-commit hooks in repository |

### Local URLs

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:8000 |
| OpenAPI docs | http://localhost:8000/docs |

---

## Testing stack

| Layer | Framework | Location | Count |
|-------|-----------|----------|-------|
| Backend routes | pytest + TestClient | `backend/tests/test_routes.py` | 15 tests |
| Frontend utils | Vitest | `frontend/src/lib/financial-utils.test.ts` | 5 tests |
| Component/E2E | — | Not configured | 0 |

Run commands:

```bash
cd backend && pytest
cd frontend && npm test
```

---

## Security configuration (dev defaults)

| Setting | Value | File |
|---------|-------|------|
| CORS | `allow_origins=["*"]`, credentials enabled | `main.py` L8–12 |
| Auth | None | — |
| Data | Public mock endpoints | All routes |

Acceptable for local mock data only. See `.agents/rules/05-docker-and-dependencies.md` before adding auth or real data.

---

## Dependency management

| Ecosystem | Pinning | Lockfile |
|-----------|---------|----------|
| npm | Semver ranges in `package.json` | `package-lock.json` committed |
| pip | Unpinned in `requirements.txt` | No lockfile |

---

## Agent tooling

| Resource | Path |
|----------|------|
| Agent guidance | `AGENTS.md` |
| Rules | `.agents/rules/` (6 files + validation) |
| Memory bank | `memory-bank/` (this directory) |
| Skills | `.agents/skills/` — not present |
