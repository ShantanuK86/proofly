# Proofly — API Reference Manual

Version: `v1` · Base URL: `/api/v1`

---

## 1. Authentication & Users

### Register Account
`POST /api/v1/auth/register`
- **Request Body**:
  ```json
  {
    "name": "Jane Founder",
    "email": "jane@studio.com",
    "password": "optionalPassword"
  }
  ```
- **Response**: `201 Created`
  ```json
  {
    "access_token": "eyJhbGci...",
    "token_type": "bearer",
    "user": {
      "id": "c6204c3e-...",
      "name": "Jane Founder",
      "email": "jane@studio.com",
      "created_at": "2026-11-11T22:00:00Z"
    }
  }
  ```

### Sign In
`POST /api/v1/auth/login`
- **Request Body**:
  ```json
  {
    "email": "jane@studio.com"
  }
  ```
- **Response**: `200 OK` (returns bearer access token).

### Current User
`GET /api/v1/me`
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `200 OK`

---

## 2. Organizations & Workspaces

### Create Organization
`POST /api/v1/organizations`
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**:
  ```json
  {
    "name": "Bright Studio",
    "slug": "bright-studio",
    "website_url": "https://brightstudio.design"
  }
  ```
- **Side effects**: Creates organization, assigns caller as `OWNER`, generates default collection page (`/r/bright-studio`) and default Wall widget.

### Current Organization
`GET /api/v1/organizations/current`
- **Headers**: `Authorization: Bearer <token>`, Optional `X-Organization-Id: <uuid>`

### Update Organization Settings
`PATCH /api/v1/organizations/current`
- **Request Body**:
  ```json
  {
    "name": "Bright Studio Inc",
    "website_url": "https://brightstudio.com",
    "branding": {
      "primary_color": "#2563EB",
      "badge_text": "Verified Client Review"
    }
  }
  ```

---

## 3. Collection Pages

### List Owned Collection Pages
`GET /api/v1/collection-pages`

### Update Collection Page
`PATCH /api/v1/collection-pages/{id}`
- **Request Body**:
  ```json
  {
    "title": "Leave a review for Bright Studio",
    "description": "Tell us how we did!",
    "is_active": true,
    "settings": {
      "thank_you_message": "Thank you! Your feedback means the world to us."
    }
  }
  ```

### Public Collection Page (Unauthenticated)
`GET /api/v1/public/collection-pages/{slug}`
- **Response**: `200 OK` with organization branding, title, description, and form settings.

---

## 4. Testimonials & Moderation

### Public Customer Submission (Unauthenticated)
`POST /api/v1/public/collection-pages/{slug}/testimonials`
- **Request Body**:
  ```json
  {
    "customer_name": "Aarav Mehta",
    "customer_email": "aarav@example.com",
    "customer_role": "Founder, NovaPay",
    "rating": 5,
    "content": "The team delivered exactly what we needed.",
    "publish_consent": true,
    "consent_version": "v1",
    "website_hp": ""
  }
  ```
- **Response**: `201 Created`
  ```json
  {
    "id": "7d5c10c7-f620-4a63-9fb1-10d515db01b5",
    "status": "PENDING",
    "message": "Thank you. Your testimonial was received."
  }
  ```

### List Testimonials (Dashboard)
`GET /api/v1/testimonials?status=PENDING&search=Aarav`
- **Status options**: `ALL`, `PENDING`, `APPROVED`, `REJECTED`.

### Moderate Status
`PATCH /api/v1/testimonials/{id}/status`
- **Request Body**:
  ```json
  {
    "status": "APPROVED"
  }
  ```

### Soft Delete Testimonial
`DELETE /api/v1/testimonials/{id}`
- **Response**: `204 No Content`

---

## 5. Widgets & Embeds

### List Owned Widgets
`GET /api/v1/widgets`

### Create Widget
`POST /api/v1/widgets`
- **Request Body**:
  ```json
  {
    "name": "Landing Page Wall",
    "type": "WALL",
    "settings": {
      "theme": "light",
      "accent_color": "#2563EB",
      "show_rating": true,
      "show_role": true,
      "show_date": true
    }
  }
  ```

### Public Widget Data (Unauthenticated)
`GET /api/v1/public/widgets/{public_id}`
- **Response**: `200 OK`
  ```json
  {
    "widget_id": "wdg_c74d6f839a01",
    "name": "Landing Page Wall",
    "type": "WALL",
    "settings": { ... },
    "organization_name": "Bright Studio",
    "organization_branding": { ... },
    "testimonials": [
      {
        "id": "7d5c10c7-...",
        "customer_name": "Aarav Mehta",
        "customer_role": "Founder, NovaPay",
        "rating": 5,
        "content": "The team delivered exactly what we needed.",
        "submitted_at": "2026-11-11T22:30:00Z"
      }
    ]
  }
  ```
  *(Notice: Customer email is never included in public responses)*

---

## 6. Analytics

### Dashboard Overview
`GET /api/v1/analytics/overview`
- **Response**: `200 OK`
  ```json
  {
    "total_received": 24,
    "total_published": 18,
    "total_pending": 6,
    "total_rejected": 0,
    "approval_rate_percent": 75.0,
    "average_rating": 4.9,
    "total_widget_views": 340,
    "active_collection_slug": "bright-studio"
  }
  ```

### Timeseries
`GET /api/v1/analytics/timeseries?days=14`
