# Contributing to Proofly

Thank you for your interest in contributing to Proofly! We appreciate contributions of all kinds: bug fixes, documentation improvements, feature additions, and user experience enhancements.

---

## Code of Conduct
Please be respectful, constructive, and collaborative in all project discussions, issue comments, and pull requests.

---

## Development Setup

1. **Fork and clone the repository:**
   ```bash
   git clone https://github.com/ShantanuK86/proofly.git
   cd proofly
   ```

2. **Backend Setup:**
   ```bash
   python3 -m venv .venv
   source .venv/bin/activate
   pip install hatchling
   pip install -e apps/api

   # Run tests
   pytest apps/api/app/tests -v
   ```

3. **Frontend Setup:**
   ```bash
   cd apps/web
   npm install
   npm run dev
   ```

---

## Pull Request Guidelines

1. **Branch Naming**:
   - `feature/description`
   - `fix/issue-description`
   - `docs/what-changed`

2. **Commit Messages**:
   Follow conventional commits:
   - `feat: add CSV export endpoint`
   - `fix: correct rating bounds validation`
   - `docs: update runbook instructions`

3. **Verification**:
   Ensure both backend tests and frontend builds pass before submitting:
   ```bash
   .venv/bin/pytest apps/api/app/tests
   cd apps/web && npm run build
   ```
