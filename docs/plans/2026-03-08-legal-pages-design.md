# Legal Pages Design

## Goal

Upgrade the four legal policy pages for Dhanvanthiri Foods into production-ready, CMS-managed pages with premium frontend presentation, strong readability, and admin-editable metadata suitable for a normal Hostinger shared-hosting deployment.

## Approved Direction

- Keep legal pages as normal CMS page entries in the backend.
- Canonical slugs:
  - `terms-and-conditions`
  - `privacy-policy`
  - `shipping-policy`
  - `refund-policy`
- Execute in two phases:
  - Phase 1: move complete long-form policy content into CMS and introduce a dedicated legal page frontend template while keeping HTML body content.
  - Phase 2: add lightweight metadata support where useful, specifically `effective_date`, while continuing to use `excerpt`, `meta_title`, and `meta_description`.

## Backend Design

### Content model

Use the existing `pages` table and CMS workflow as the source of truth.

Existing fields already usable:
- `title`
- `slug`
- `content`
- `excerpt`
- `meta_title`
- `meta_description`

New field for Phase 2:
- `effective_date`

### Content management

- Legal pages remain regular page records, editable from admin/CMS.
- Full policy copy is seeded or updated through backend migration(s), so production deployments receive correct baseline content.
- `excerpt` becomes the short summary surfaced in the frontend summary card.
- `effective_date` powers the “Last updated” metadata row.

## Frontend Design

### Routing and page flow

Keep `DynamicPage` as the entry point for CMS pages.

Flow:
- `DynamicPage`
- detect legal slug
- render `LegalPageTemplate`
- sanitize and normalize CMS HTML
- generate anchors and table of contents from `h2` and `h3`

Non-legal CMS pages continue using the simpler generic renderer.

### Legal page shell

`LegalPageTemplate` will provide:
- warm off-white page backdrop
- centered reading width
- premium editorial title
- metadata row for effective date
- summary card using `excerpt`
- optional table of contents on pages with multiple headings
- styled long-form content
- support / grievance callout at bottom
- clear link to contact page

### Content rendering rules

The legal renderer should not directly dump raw HTML into a plain prose block.

It should:
- sanitize editor HTML
- strip unsafe tags and attributes
- normalize links and list markup
- assign deterministic anchor ids to headings
- keep typography resilient against messy CMS HTML

## UX and Visual Direction

- Background: warm off-white
- Content surface: white / soft ivory
- Headings: deep ink green / navy tone
- Body copy: dark charcoal
- Soft dividers and low-contrast borders
- Comfortable line length and large vertical rhythm
- Mobile-safe spacing and heading scale

## Testing Strategy

### Frontend

- add failing tests for legal slug detection
- verify summary and effective date render in template
- verify generated table of contents and heading anchors
- verify sanitizer removes unsafe markup
- verify support box appears for legal pages

### Backend

- add tests for page create/update handling of `effective_date`
- add tests for public page response including `effective_date`

## Constraints

- No git repository is available in the workspace root, so design and plan files can be saved but not committed from this environment.
- The backend runtime is not currently executable in this shell because `php` is unavailable, so backend verification will be limited to static code changes unless the runtime becomes available.
