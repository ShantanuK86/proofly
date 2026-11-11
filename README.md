# Proofly

<div align="center">

![CI Status](https://github.com/ShantanuK86/proofly/actions/workflows/ci.yml/badge.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Python](https://img.shields.io/badge/python-3.12%2B-blue?logo=python)
![FastAPI](https://img.shields.io/badge/FastAPI-0.110%2B-009688?logo=fastapi)
![Next.js](https://img.shields.io/badge/Next.js-14%2B-black?logo=next.js)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?logo=postgresql)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker)

**Collect trust. Display proof. Win customers.**

*A lightweight multi-tenant SaaS where businesses collect authentic customer testimonials through a shareable link, approve submissions, and display them on websites using a customizable, zero-conflict widget.*

[Explore Live Demo](http://localhost:3000/demo) · [API Documentation](http://localhost:8000/docs) · [System Design](docs/DESIGN.md)

</div>

---

## 🚀 One-Click Cloud Deployment

Deploy your own instance of Proofly with pre-configured PostgreSQL, FastAPI, and Next.js:

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)
[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FShantanuK86%2Fproofly&root-directory=apps/web)

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
pip install hatchling
pip install -e apps/api

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
This project is licensed under the [MIT License](LICENSE).
