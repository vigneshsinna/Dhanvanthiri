# Vainavi Goodies E-commerce Platform

A modern, high-performance, full-stack scalable e-commerce platform designed to provide a seamless shopping experience for customers and robust management tools for administrators.

## 🚀 Features

### Customer Experience & Storefront
*   **Intuitive Storefront:** Responsive, fast-loading, and mobile-first design.
*   **Advanced Catalog & Taxonomy:** Deep categorization, dynamic filtering, product tags, and optimized search capabilities.
*   **Shopping Cart & Wishlist:** Persistent shopping cart, guest checkout options, and user wishlists.
*   **Secure Checkout & Payments:** Seamless payment gateway integration with multi-currency support and end-to-end encryption.
*   **User Profiles:** Order history, address book management, and profile customization.
*   **Product Reviews:** Ratings and reviews system for products.
*   **Order Tracking:** Track order status easily through the public tracking feature.

### SEO Enhancements
*   **Dynamic Meta Tags:** Configurable per-page metadata handled via specialized SEO components (`src/components/seo/`).
*   **Structured Data (JSON-LD):** Semantic markup for products and categories to enhance search engine rich snippets.
*   **Canonical URLs:** Auto-generated standardized paths to prevent duplicate content penalties.
*   **Semantic HTML:** Optimized tag hierarchy (H1, H2, etc.) for storefront pages, improving accessibility and crawler parsing.
*   **Sitemap & Robots Automation:** Built-in hooks and static files for guiding search engine spiders effectively over the vast catalog.

### Platform & Payment Security
*   **Advanced Fraud Detection:** Multi-layer risk assessment, transaction scoring, and anomalies detection.
*   **Blocked Entity Management:** Proactive blocking of suspicious IPs, emails, cards, and devices.
*   **Payment Velocity Tracking:** Automatic detection and mitigation of rapid transaction patterns.
*   **Payment Recovery:** Automated email campaigns at scheduled intervals (1hr, 4hr, 24hr) with secure retry links for failed payments.
*   **Security protocols:** JWT-based secure authentication, short-lived tokens, timing-safe signature verification.

### Admin & Operations
*   **Order Management System (OMS):** End-to-end order lifecycle tracking, fulfillment status operations.
*   **Refund & Return Management:** Advanced approval workflow for handling customer returns, logging, and processing full/partial refunds.
*   **Payment Analytics Dashboard:** Comprehensive real-time metrics, success rate tracking, daily breakdowns, and recovery statistics.
*   **Fraud Dashboard:** Centralized view to monitor fraud checks, manage blocked entities, and review score factors.
*   **Product CRM:** Full CRUD operations for products with bulk actions and tag/category mapping management.
*   **User Management:** Centralized control over roles, customers, and data.

## 🛠️ Tech Stack

### Backend (RESTful API)
*   **Framework:** Laravel 11 (PHP 8.2+)
*   **Database:** MySQL 8
*   **Authentication:** `tymon/jwt-auth`
*   **Architecture:** Feature-based Resource Controllers, Form Requests, Queued Jobs, and File-based Caching

### Frontend (Single Page Application)
*   **Framework:** React 18 with TypeScript
*   **Build Tool:** Vite
*   **Styling:** Tailwind CSS & Lucide Icons
*   **State Management:** Redux Toolkit & React Query
*   **Routing:** React Router v6
*   **Form Handling:** React-Hook-Form + Zod validation

## 📂 Project Structure

```text
root/
├── backend/               # Laravel API Backend
│   ├── app/               # Controllers, Models, Middleware, Services
│   ├── config/            # Application & Package configurations
│   ├── database/          # Migrations, Seeders, Factories
│   ├── routes/            # API endpoints definition
│   └── tests/             # PHPUnit Test Suite
│
├── frontend/              # React Frontend Application
│   ├── src/               
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page-level components
│   │   ├── store/         # Redux state slices
│   │   ├── services/      # Axios API integrations
│   │   ├── hooks/         # Custom React hooks
│   │   └── types/         # TypeScript interfaces
│   └── vite.config.ts     # Vite bundler configuration
│
└── docs/                  # System blueprints, test suites, and deployment guides
```

## 📚 Documentation Reference

To help navigate the core requirements, workflows, and specifications, the platform includes the following detailed documentation files:

### Core System & Planning
*   `specs/00_system_blueprint.md` - High-level system architecture and module boundaries.
*   `complete-system-review.md` & `backend/complete-system-review.md` - In-depth audits of current components.
*   `VG_Find_Your_Routine_Page.md` - Specifications for the dedicated "Routine" store feature.
*   `VG_Thoughtful_Gifting_Bundles_Build_a_Bundle_Plan.md` - Specs for dynamic product bundling.

### Technical Documentation & Workflows
*   `docs/PAYMENT_MODULE_WORKFLOW.md` - End-to-end overview of checkout, razorpay, and fraud handlers.
*   `docs/FRONTEND_PAGES.md` - Registry and routing matrix of frontend React single-page views.
*   `docs/module_workflows/...` - Detailed micro-flow breakdowns for internal dependencies.

### Migration & Data Mapping
*   `full_product_category_tag_mapping_clean_UPDATED_REVIEWED.md` - Main taxonomy mapping source-of-truth.
*   `csv_product_analysis.md` - Analytics file from legacy WooCommerce catalog structure.
*   `specs/import/` & `specs/migration/` - Documentation for product & system migration flows.

### Deployment & QA
*   `docs/DEPLOYMENT.md` & `docs/deployment_hostinger.md` - Infrastructure and cloud provisioning guides.
*   `docs/PRE_DEPLOYMENT_CHECKLIST.md` & `docs/PRODUCTION_AUDIT_REPORT.md` - Launch instructions and stability checks.
*   `docs/ecommerce_test_suite_razorpay.md` & `docs/TEST_RESULTS_SUMMARY.md` - Test matrices and pipeline states.
*   `docs/razorpay_test_credentials.md` - Dummy accounts for QA staging environments.
*   `docs/bugs_found.md` - Ongoing issue tracker.
*   `frontend/CHANGELOG.md` - Semantic versioning history for the React web app.

## 💻 Development Setup

### Prerequisites
*   PHP 8.2+ & Composer
*   Node.js 18+ & npm
*   MySQL 8

### Backend Initialization
```bash
cd backend
composer install
cp .env.example .env

# Generate application & JWT keys
php artisan key:generate
php artisan jwt:secret

# Run database migrations and seed default data
php artisan migrate --seed

# Start the local development server
php artisan serve
```

### Frontend Initialization
```bash
cd frontend
npm install

# Start the Vite development server
npm run dev
```

## 📋 Development Guidelines

*   **API Standards:** Strictly adhere to RESTful patterns, utilize properly named Resource controllers, and return consistent JSON structures.
*   **Frontend Patterns:** Use Redux Toolkit for complex global state, clean functional components, and handle form validation exclusively via Zod schemas.
*   **Security:** Ensure rate limiting is active on authentication endpoints. Use short-lived JWT tokens (15 mins) alongside HTTP-only cookies for refresh tokens.

## 🚀 Production Deployment

This project is built to be deployed on any standard VPS or Managed Cloud environment (AWS, DigitalOcean, Linode, Shared Hosting with CLI access, etc.).

### Build & Deploy Steps
1.  **Frontend Build:** Run `npm run build` in the `frontend` directory. Move the generated `dist` files to your public server directory or a CDN.
2.  **Environment Configuration:** Configure production database credentials, API keys, and set `APP_ENV=production` & `APP_DEBUG=false` in the backend `.env`.
3.  **Optimization:**
    ```bash
    php artisan config:cache
    php artisan route:cache
    php artisan view:cache
    ```

### Required Cron Jobs
To enable background queues, analytics processing, and order automation, ensure the following cron scheduled task is configured on your production server (runs every minute):

```bash
* * * * * cd /path-to-your-project/backend && php artisan schedule:run >> /dev/null 2>&1
```

For robust queue processing in production, utilizing Supervisor to keep `php artisan queue:work` running is highly recommended.

## Scaffold Status (March 3, 2026)

This repository now includes an implementation scaffold for the new Hostinger-ready architecture:

- `backend/` with feature-based Laravel-style modules, API routes, requests, services, models, jobs, and migrations.
- `frontend/` with a real React 18 + TypeScript + Vite + Tailwind application, router, Redux Toolkit slices, React Query hooks, and starter pages.
- `deploy/hostinger/` with `.htaccess` templates and cron configuration examples for shared hosting.
- `docs/traceability/requirements-traceability-matrix.md` and `docs/architecture/system-architecture.md`.

Environment note:

- Frontend build is verified in this workspace.
- Backend runtime verification requires `php` and `composer` to be installed locally.
