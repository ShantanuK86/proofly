# Proofly — Product Requirements & System Design

MVP Architecture v1.0

Micro-SaaS · Multi-tenant · Full-stack · Production-oriented

# Proofly

Collect trust. Display proof. Win customers.

A lightweight SaaS where businesses collect authentic customer testimonials through a shareable link, approve submissions, and display them on websites using a customizable widget.

## 1. Executive summary

The goal is to create a product that real freelancers, agencies, consultants, coaches, and small businesses can start using in minutes.

A business should be able to sign up, generate a review-collection page, share its link, collect testimonials, and publish approved reviews on its own website without technical expertise.

This is a multi-tenant SaaS: each business has separate data, branding, review pages, and widgets, while all businesses share the same application infrastructure.

### Our product principles

- Small MVP, strong fundamentals: Deliver a complete end-to-end user journey before advanced features.
- Backend simplicity: Prefer a modular monolith over microservices.
- Secure by default: Tenant isolation, private pending submissions, rate limiting, and consent records.
- Actual usage over vanity features: Track activation, genuine review submissions, and widget adoption.
- Growth-ready architecture: Support multiple organizations, domains, and widgets without rewriting the backend.

### MVP success criteria

- 5 Businesses activated
- 20 Genuine reviews collected
- 3 Live widget installations
- 2 Potential paying customers

## 2. Product scope

### Three user roles

| Actor           | Responsibilities                                                    |
| --------------- | ------------------------------------------------------------------- |
| Business owner  | Creates and manages their workspace, branding, reviews, and widgets |
| Customer        | Submits a testimonial through a public link                         |
| Website visitor | Views published testimonials on the business's website              |

In the MVP, one user can own one organization. However, the database supports organization memberships from day one so that multi-user teams can be added without a major redesign.

### MVP features and priorities

| Feature                               | Priority |
| ------------------------------------- | -------- |
| Signup, login, logout                 | P0       |
| Organization onboarding               | P0       |
| Public testimonial collection page    | P0       |
| Rating, name, feedback, consent       | P0       |
| Pending/approved/rejected moderation  | P0       |
| Embeddable testimonial widget         | P0       |
| Organization branding                 | P0       |
| Basic dashboard metrics               | P0       |
| Spam and abuse prevention             | P0       |
| Email notification of new submissions | P1       |
| CSV export                            | P1       |
| Multiple collection pages             | P1       |
| Team member invitations               | P2       |
| Video testimonials                    | P2       |
| AI-generated review summaries         | P2       |
| Payments and subscriptions            | P2       |
| Third-party review imports            | P2       |

## 3. User journeys and UI design

### Journey A — Business owner
1. Create account
2. Set up business profile & branding
3. Generate collection link
4. Share with customers
5. Moderate incoming reviews (Pending -> Approved / Rejected)
6. Embed widget on website

### Journey B — Customer submits a testimonial
1. Visits `https://proofly.app/r/{slug}`
2. Enters name, optional role/company, optional email
3. Selects rating (1-5 stars)
4. Writes testimonial content (10-2000 chars)
5. Explicitly checks consent checkbox
6. Submits; review enters PENDING status

### Journey C — Website visitor
1. Opens business website with embedded widget iframe (`/embed/{widget_id}`)
2. Widget fetches approved, publish-consented reviews
3. Renders responsive wall or carousel widget matching brand style

### Main application routes
- `/signup` - Register account
- `/login` - Authenticate
- `/onboarding` - Create organization
- `/dashboard` - Overview & activation status
- `/dashboard/reviews` - Moderate testimonials
- `/dashboard/collect` - Collection link and branding
- `/dashboard/widgets` - Widget creation and embed instructions
- `/dashboard/settings` - Business profile and account settings
- `/r/{slug}` - Public testimonial collection page
- `/embed/{widget_id}` - Public iframe widget
- `/demo` - Live preview testing website
