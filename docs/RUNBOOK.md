# Proofly — Operational Runbook

This guide covers local development, running tests, database migrations, Docker Compose deployment, and production verification.

---

## 1. Quickstart (Local Development)

### Prerequisites
- Python 3.11+
- Node.js 18+ & npm
- (Optional) Docker for PostgreSQL

### Step 1: Start Backend API
From the project root:
```bash
# Activate virtual environment
source .venv/bin/activate

# Install backend dependencies (editable mode)
uv pip install -e apps/api

# Run database migrations (or table auto-init)
cd apps/api
alembic upgrade head

# Start FastAPI development server
uvicorn app.main:app --reload --port 8000
```
API Documentation will be live at `http://localhost:8000/docs`.

### Step 2: Start Next.js Frontend
In a new terminal:
```bash
cd apps/web

# Install packages
npm install

# Start Next.js development server
npm run dev
```
Open `http://localhost:3000` to interact with Proofly.

---

## 2. Running Automated Tests

Run backend tests using Pytest (10 tests covering auth, tenant isolation, honeypot bot trap, rate limits, moderation lifecycle, and widget APIs):
```bash
.venv/bin/pytest apps/api/app/tests -v
```

Run frontend build & typecheck:
```bash
cd apps/web && npm run build
```

---

## 3. Running with Docker Compose

To spin up the complete multi-tenant stack (PostgreSQL + FastAPI + Next.js):
```bash
cd infra
docker compose up --build
```
- Web Application: `http://localhost:3000`
- FastAPI Server: `http://localhost:8000`
- PostgreSQL: `localhost:5432`

---

## 4. Key Workflows & Routes

| Route | Purpose |
| --- | --- |
| `/` | Landing page with Hero and live Wall of Love widget demo |
| `/signup` & `/login` | Authentication |
| `/onboarding` | Workspace setup and default collection page generator |
| `/dashboard` | Activation overview, counter metrics, and recent submissions |
| `/dashboard/reviews` | Moderation queue: Approve, Reject, Unpublish, Delete |
| `/dashboard/collect` | Review collection page settings & copy link |
| `/dashboard/widgets` | Wall vs Carousel customizer & iframe embed generator |
| `/dashboard/settings` | Business profile and branding customization |
| `/r/[slug]` | Customer review submission page (honeypot + consent checkbox) |
| `/embed/[widget_id]` | Standalone public iframe widget |
| `/demo` | Sample external client website showcasing live embedded widget |
