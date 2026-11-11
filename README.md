# Proofly

> **Collect trust. Display proof. Win customers.**

Proofly is a lightweight multi-tenant SaaS where businesses, agencies, coaches, and freelancers collect authentic customer testimonials through a shareable link, moderate incoming feedback, and display approved reviews on their websites using customizable, zero-conflict embeddable widgets.

---

## 🌟 Key Features

- **Multi-Tenant Workspace**: Isolated organization data, custom branding, and role-based permissions (`OWNER`, `ADMIN`, `VIEWER`).
- **Branded Collection Link**: Fast, accessible review collection pages (`/r/{slug}`) with prompt inspiration questions and instant thank-you feedback.
- **Privacy & Consent by Default**: Explicit customer publication consent captured with versioning; customer emails are stored securely for identity verification and **strictly excluded from all public APIs**.
- **Moderation Inbox**: Pending review moderation (`PENDING` → `APPROVED` / `REJECTED`), unpublish capabilities, soft-deletes, and audit logging.
- **Embeddable Widgets**: Responsive Wall of Love and Carousel layouts with theme customizers (light/dark, brand accent color) and copy-paste iframe snippets that work seamlessly on WordPress, Webflow, Framer, Squarespace, and custom HTML.
- **Abuse Prevention**: Built-in anti-bot honeypot fields and sliding-window IP rate limiting.
- **Activation Analytics**: Real-time counters for review volume, approval rates, average star ratings, and widget view impressions.

---

## 🏗️ Architecture & Tech Stack

```
proofly/
├── apps/
│   ├── web/                       # Next.js 14+ (App Router, Tailwind CSS, TypeScript)
│   │   ├── src/app/               # Dashboard, Auth, Collection Pages, Embeds
│   │   ├── src/components/        # Widgets (Wall, Carousel), UI & Dashboard elements
│   │   └── src/lib/               # Typed API client & Auth context
│   └── api/                       # Python / FastAPI Modular Monolith
│       ├── app/
│       │   ├── core/              # Config, Security, Database, Exceptions, Logging
│       │   ├── models/            # SQLAlchemy 2.0 Async Entities
│       │   ├── modules/           # Auth, Organizations, Collection Pages, Testimonials, Widgets, Analytics
│       │   ├── integrations/      # Rate limiter & Spam prevention
│       │   └── tests/             # Pytest automated test suite
│       ├── alembic/               # Database migrations
│       └── pyproject.toml
├── infra/
│   └── docker-compose.yml         # Full-stack Docker topology (Postgres, FastAPI, Next.js)
└── docs/
    ├── PRD.md                     # Product Requirements Document
    ├── DESIGN.md                  # System Design & Security Specification
    ├── API.md                     # REST API Reference
    └── RUNBOOK.md                 # Operations & Troubleshooting Guide
```

---

## 🚀 Quickstart

### 1. Run with Docker Compose
```bash
cd infra
docker compose up --build
```
- **Web App**: [http://localhost:3000](http://localhost:3000)
- **API Docs (Swagger)**: [http://localhost:8000/docs](http://localhost:8000/docs)

---

### 2. Manual Development Setup

#### Backend (FastAPI):
```bash
# Set up virtual environment and install dependencies
source .venv/bin/activate
uv pip install -e apps/api

# Run tests
pytest apps/api/app/tests -v

# Start development server
cd apps/api
uvicorn app.main:app --reload --port 8000
```

#### Frontend (Next.js):
```bash
cd apps/web
npm install
npm run dev
```

---

## 🧪 Testing

Proofly includes automated tests verifying the critical user journeys, tenant boundaries, abuse protection, and public sanitization:

```bash
.venv/bin/pytest apps/api/app/tests -v
```

```
apps/api/app/tests/test_abuse_prevention.py ...           [30%]
apps/api/app/tests/test_auth_and_orgs.py ..               [50%]
apps/api/app/tests/test_tenant_isolation.py .             [60%]
apps/api/app/tests/test_testimonials_and_moderation.py .. [90%]
apps/api/app/tests/test_widgets_and_public.py .           [100%]
====================== 10 passed in 0.35s =======================
```

---

## 📄 License
MIT
