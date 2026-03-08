# Legal Pages Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Deliver production-ready legal pages that are CMS-managed, admin-editable, visually premium, and structured through a dedicated legal page template.

**Architecture:** Keep backend CMS pages as the canonical source of truth. Add a dedicated frontend legal template with sanitized HTML rendering, heading anchors, a table of contents, and support callouts. Extend the CMS page model with `effective_date` while reusing existing `excerpt` and SEO fields.

**Tech Stack:** Laravel 11 backend, React 18, TypeScript, Tailwind CSS, Vitest, existing CMS page APIs.

---

### Task 1: Add frontend failing tests for legal template behavior

**Files:**
- Modify: `frontend/src/features/cms/pages/DynamicPage.test.tsx`
- Create: `frontend/src/features/cms/pages/LegalPageTemplate.test.tsx`
- Create: `frontend/src/features/cms/utils/legalPageContent.test.ts`

**Step 1: Write the failing tests**

- Add tests proving legal slugs render a dedicated legal page shell.
- Add tests for summary card, effective date row, TOC entries, support callout, and sanitized output.

**Step 2: Run test to verify it fails**

Run: `npm test -- src/features/cms/pages/DynamicPage.test.tsx src/features/cms/pages/LegalPageTemplate.test.tsx src/features/cms/utils/legalPageContent.test.ts`

Expected: FAIL because the legal template and sanitizer do not exist yet.

### Task 2: Implement frontend legal rendering utilities and template

**Files:**
- Create: `frontend/src/features/cms/utils/legalPageContent.ts`
- Create: `frontend/src/features/cms/pages/LegalPageTemplate.tsx`
- Modify: `frontend/src/features/cms/pages/DynamicPage.tsx`
- Modify: `frontend/src/index.css`

**Step 1: Write minimal implementation**

- Add legal slug detection.
- Add sanitized HTML transformation.
- Generate heading anchors and table of contents.
- Render premium legal layout using CMS page data.

**Step 2: Run tests**

Run: `npm test -- src/features/cms/pages/DynamicPage.test.tsx src/features/cms/pages/LegalPageTemplate.test.tsx src/features/cms/utils/legalPageContent.test.ts`

Expected: PASS

### Task 3: Add backend failing tests for `effective_date`

**Files:**
- Create: `backend/tests/Feature/LegalPageMetadataTest.php`

**Step 1: Write the failing tests**

- Verify page create/update accepts `effective_date`.
- Verify public `/api/pages/{slug}` includes `effective_date`.

**Step 2: Run test to verify it fails**

Run: `php artisan test --filter=LegalPageMetadataTest`

Expected: FAIL because the schema and controllers do not support `effective_date` yet.

### Task 4: Add `effective_date` to the backend CMS model and APIs

**Files:**
- Create: `backend/database/migrations/2026_03_08_000010_add_effective_date_to_pages_table.php`
- Modify: `backend/app/Modules/CMS/Models/Page.php`
- Modify: `backend/app/Modules/CMS/Http/Controllers/PageController.php`
- Modify: `backend/app/Modules/CMS/Http/Controllers/AdminPageController.php`

**Step 1: Implement schema and controller support**

- Add nullable `effective_date` column.
- Validate it in admin create/update endpoints.
- Return it in public page response.

**Step 2: Run backend tests**

Run: `php artisan test --filter=LegalPageMetadataTest`

Expected: PASS

### Task 5: Update admin CMS page editing for legal-page metadata

**Files:**
- Modify: `frontend/src/features/admin/pages/AdminPagesPage.tsx`
- Modify: `frontend/src/test/msw-handlers.ts`

**Step 1: Add failing tests if practical**

- If the admin page already has coverage nearby, extend it; otherwise keep this change covered through API contract and component behavior where feasible.

**Step 2: Implement admin form fixes**

- Align `body` with backend `content`.
- Expose slug, excerpt, effective date, meta title, and meta description.
- Ensure edit mode loads existing values.

**Step 3: Run targeted frontend tests**

Run: `npm test -- src/features/cms/pages/DynamicPage.test.tsx src/features/cms/pages/LegalPageTemplate.test.tsx src/features/cms/utils/legalPageContent.test.ts`

Expected: PASS

### Task 6: Replace legal seed content with full production copy

**Files:**
- Modify: `backend/database/migrations/2026_03_07_000009_update_legal_pages_content.php`
- Optionally modify: `backend/database/seeders/ProductSeeder.php`

**Step 1: Update content**

- Rewrite all four policies with complete long-form HTML.
- Populate `excerpt`, `meta_title`, `meta_description`, and `effective_date`.

**Step 2: Verify**

- Static review for legal structure completeness.
- Frontend tests remain green.

### Task 7: Final verification

**Files:**
- No code changes required unless failures appear.

**Step 1: Run frontend verification**

Run: `npm test -- src/features/cms/pages/DynamicPage.test.tsx src/features/cms/pages/LegalPageTemplate.test.tsx src/features/cms/utils/legalPageContent.test.ts`

Expected: PASS

**Step 2: Run backend verification if runtime is available**

Run: `php artisan test --filter=LegalPageMetadataTest`

Expected: PASS

**Step 3: Record limitations**

- If backend runtime is unavailable, document that backend tests could not be executed in this environment.
