# Docker and Dependencies

## Scope

**Applies when:** Editing `docker-compose.yml`, Dockerfiles, `vite.config.ts` proxy, `requirements.txt`, `package.json` dependencies, `backend/app/main.py` CORS, or README run instructions.

**Does not apply when:** Dashboard React components with no port/env/container impact.

## Rationale

**Problem observed:** Compose lacks healthchecks; Vite proxy is Docker-only; Python deps unpinned; debug port exposed by default (Phase 2 → DX, Security).

**Why this rule helps:** `docker compose up --build` is the primary workflow in README — these rules keep that path reliable without mandating production infra.

## Requirements

### MUST

- Keep `GET /health` returning `{"status": "ok"}`
- Document ports when changing Compose/Dockerfiles: **5173** (frontend), **8000** (API), **5678** (debugpy, dev only)
- Preserve `frontend/.env.example` for optional `VITE_API_BASE_URL`
- Never commit `.env` files
- Commit `frontend/package-lock.json` with npm dependency changes

### SHOULD

- When editing `docker-compose.yml`, add backend healthcheck and `depends_on: condition: service_healthy`:

```yaml
backend:
  healthcheck:
    test: ["CMD-SHELL", "python -c \"import urllib.request; urllib.request.urlopen('http://localhost:8000/health')\""]
    interval: 10s
    timeout: 5s
    retries: 5
    start_period: 10s

frontend:
  depends_on:
    backend:
      condition: service_healthy
```

- Pin Python packages on next `requirements.txt` touch

### MUST NOT

- Commit secrets or API keys
- Add production multi-stage Dockerfiles unless explicitly requested
- Remove anonymous `/app/node_modules` volume without documenting why

## Security defaults (mock-data phase only)

| Setting | Location | When adding auth or real data |
|---------|----------|--------------------------------|
| CORS `*` + credentials | `main.py` L8–12 | Restrict `allow_origins` |
| Public endpoints | all routes | Add auth middleware |
| debugpy :5678 | `backend/Dockerfile` | Gate behind compose profile |

## Repository anchors

| Status | Location | Notes |
|--------|----------|-------|
| Good example | `docker-compose.yml` | Bind mounts + node_modules volume |
| Good example | `frontend/.env.example` | Optional API base URL |
| Known gap | `docker-compose.yml` | No healthcheck |
| Known gap | `vite.config.ts` L13 | `backend:8000` only |
| Known gap | `requirements.txt` | Unpinned |

## Task examples

See [rule-validation.md](./rule-validation.md) → **Task E** (compose healthcheck)
