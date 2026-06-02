# QA Report — Mercato dApp (Issue #52)

**Tester:** romina-iurchik
**Date:** 2026-05-31
**Environment:** Local — `npm run dev` and production build (`npm run build` + `npm start`) + Supabase cloud project
**Build:** Next.js 16.1.6 (Turbopack)

---

## Summary

A QA pass was started across the scope defined in #52. Sections 1 (Public / Landing Pages) and 2 (Authentication) were fully tested. During Section 2, a **critical bug (BUG-04)** was found: the notification realtime subscription throws a client-side exception that **crashes every authenticated page** (confirmed on `/dashboard` and `/settings`, in the production build).

Because BUG-04 blocks all authenticated routes, **Sections 3–10 (Dashboard, Supplier Profile, Ramp, Wallet, Deal Creation, Settings, Notifications, Admin) could not be reliably tested.** Those sections — plus the data-dependent checks in Section 1 and the cross-cutting Sections 11–13 — are deferred until BUG-04 is resolved on `main`. As agreed with the maintainers, testing will resume once the fixes are merged.

**Bugs found:** 4 (1 critical, 3 minor/medium).

---

## Status by section

| # | Section | Status | Notes |
|---|---------|--------|-------|
| 1 | Public / Landing Pages | Tested — bugs found | BUG-01, BUG-02, BUG-03. Data-dependent checks (#36/#37/#38) deferred. |
| 2 | Authentication | Tested — critical bug | Sign-up/role-selection OK. BUG-04 (blocker) found. |
| 3 | Dashboard — General | Blocked by BUG-04 | Authenticated routes crash. |
| 4 | Supplier Profile | Blocked by BUG-04 | Authenticated routes crash. |
| 5 | Ramp (On/Off) | Blocked by BUG-04 | Authenticated routes crash. |
| 6 | Wallet & Blockchain | Blocked by BUG-04 | Authenticated routes crash. |
| 7 | Deal Creation | Blocked by BUG-04 | Authenticated routes crash. |
| 8 | Settings | Blocked by BUG-04 | Authenticated routes crash. |
| 9 | Notifications | Blocked by BUG-04 | Component is the source of BUG-04. |
| 10 | Admin Panel | Blocked by BUG-04 | Authenticated routes crash. |
| 11 | Internationalisation (i18n) | Partial | Public-page locale toggle works (text switches). Hero bg = BUG-01. Authenticated i18n deferred. |
| 12 | Responsive Design | Deferred | To be done once authenticated routes are testable. |
| 13 | Code Quality & Console | Partial | Public pages clean; one dev-only Turbopack artifact noted. Authenticated console deferred. |

---

## Section 1 — Public / Landing Pages (detail)

| Route | Result |
|-------|--------|
| `/` | BUG-01 (hero bg ES), BUG-02 (navbar anchors) |
| `/how-it-works` | OK — renders, no console errors |
| `/our-story` | BUG-03 (missing navbar) |
| `/deals` | OK — empty state correct (deal cards #38 need data) |
| `/deals/[id]` | OK — invalid ID returns 404 |
| `/suppliers` | OK — empty state correct (logos #37 need data) |
| `/suppliers/[id]` | OK — invalid ID returns 404 (product images #36 need data) |
| `/investors` | OK — empty state correct |
| `/investors/[id]` | OK — invalid ID returns 404 |
| `/pymes` | OK — empty state correct |
| `/pymes/[id]` | OK — invalid ID returns 404 (dev-only Turbopack console noise, see notes) |
| `/marketplace` | OK |
| `/orders` | OK |

**CTAs (`/`):** "Comenzar" → `/auth/sign-up` OK; "Iniciar sesion" → `/auth/login` OK; "Explorar oportunidades" → `/deals` OK

**Scroll animations (`/`):** OK

**Navbar anchors (`/`):** FAQ OK; Who it's for OK; Why Mercato OK; Live on Mercato OK; How it works BROKEN (BUG-02); Built with BROKEN (BUG-02)

---

## Section 2 — Authentication (detail)

| Check | Result |
|-------|--------|
| Sign-up (`/auth/sign-up`) | OK — submits to Supabase, creates user, redirects to success |
| Sign-up success | OK — shows email verification message |
| Role selection (onboarding) | OK — role persists (tested as Supplier) |
| Protected routes | OK — unauthenticated `/dashboard` redirects to `/auth/login` |
| Login → authenticated app | BLOCKED — authenticated pages crash on load (BUG-04) |

---

## Bugs found

### BUG-01 — Hero background broken for ES locale (missing asset)

- **Severity:** Medium
- **Route/component:** `/` — `components/landing/landing-hero.tsx` (lines 20, 37)
- **Steps to reproduce:** (1) Open `/` and toggle to Spanish (ES); background does not change. (2) Refresh (F5) while in ES; background disappears.
- **Expected:** Hero shows the Spanish background variant (per #34 acceptance criteria).
- **Actual:** On toggle, the background stays the same (EN image via `onError` fallback); on refresh in ES the background disappears. Console: `hero-bg-es.png:1 Failed to load resource: 404 (Not Found)`.
- **Root cause:** Line 20 references `/hero-bg-es.png`, which does not exist in `public/` (only `hero-bg.png` is present). The `onError` fallback (line 37) does not reliably restore the image on initial load.
- **Device/viewport/locale:** All viewports / ES
- **Related:** #34, already partially tracked in #54

### BUG-02 — Navbar anchors "How it works" and "Built with" scroll to wrong section

- **Severity:** Minor
- **Route/component:** `/` — `lib/navigation/landing-nav.ts`, `components/landing/landing-page-intro.tsx`
- **Steps to reproduce:** Open `/`, click "Built with" and "How it works" in the navbar.
- **Expected:** Each link scrolls to and visually lands on its own section.
- **Actual:** "Built with" and "How it works" both land on the "Who it's for" (roles) section instead of their own.
- **Root cause:** `id="built-with"` is duplicated in `landing-page-intro.tsx` (lines 66 and 77); HTML ids must be unique, so `getElementById` resolves the first match. For "How it works", the anchor (`#how-it-works`, `landing-hero.tsx` line 118) is correct but the short section height leaves the roles section dominating the viewport. URLs are correct, so the issue is DOM-side.
- **Device/viewport/locale:** Desktop / EN

### BUG-03 — /our-story is missing the navbar

- **Severity:** Minor
- **Route/component:** `/our-story` — `app/our-story/page.tsx`
- **Steps to reproduce:** Navigate to `/our-story`.
- **Expected:** Page shows the public navbar at the top, consistent with other public pages (e.g. `/how-it-works`).
- **Actual:** Page renders only `<main>` with the article content + reused `<LandingCta />`. No navbar — no way to navigate in/out of the page.
- **Root cause:** `app/our-story/page.tsx` does not import or render `<Navigation />`. By comparison, `/how-it-works` (`how-it-works-view.tsx`) imports `Navigation` (line 4) and renders `<Navigation />` (line 123). There is no shared public layout, so each public page must include it; `/our-story` omits it.
- **Suggested fix:** Render `<Navigation />` at the top of the `/our-story` page, matching `how-it-works-view.tsx`.
- **Console:** No errors
- **Device/viewport/locale:** Desktop / EN

### BUG-04 — Notifications realtime subscription crashes all authenticated pages (CRITICAL)

- **Severity:** Critical — blocks the entire authenticated app.
- **Route/component:** `components/notifications/notification-dropdown.tsx:62` (first `.on()` call), mounted via `components/navigation.tsx:191` (NotificationDropdown is in the authenticated navbar). Reproduced on `/settings` and `/dashboard`.
- **Steps to reproduce:** (1) Log in with any user. (2) Land on any authenticated page (the navbar mounts the notification dropdown).
- **Expected:** Notifications subscribe to Supabase Realtime without errors; the page renders normally.
- **Actual:** The page crashes with "Application error: a client-side exception has occurred." Console: `Uncaught Error: cannot add 'postgres_changes' callbacks for realtime:notifications-changes after 'subscribe()'.` Confirmed in the production build (`npm run build` + `npm start`); persists after hard refresh / cache clear.
- **Root cause:** The `useEffect` creates a Realtime channel with a fixed name `'notifications-changes'` and chains `.on().on().subscribe()`. When the effect re-runs (React Strict Mode double-mount and/or `fetchNotifications` reference change in the dependency array), Supabase reuses the already-subscribed channel and rejects the new `.on()` callbacks.
- **Suggested fix:** Use a unique channel name per user (e.g. `notifications-changes-${userId}`) and/or remove any existing channel before subscribing; stabilize the effect dependencies so the subscription is created once per `userId`.
- **Device/viewport/locale:** Any / EN — production build

---

## Dev-only notes (not bugs)

- **Turbopack dev SyntaxError on invalid dynamic-route IDs** (e.g. `/pymes/123`): in `npm run dev`, navigating to an invalid dynamic ID occasionally shows `Uncaught SyntaxError: Invalid or unexpected token` (from an `app_layout_tsx_*.js` Turbopack chunk) plus a Next.js "1 Issue" badge. Does NOT occur in the production build (`npm run build` + `npm start`) — the 404 renders cleanly. Classified as a Turbopack dev-server artifact, not an application bug.

---

## Next steps

1. BUG-04 (critical) should be resolved first — it blocks all authenticated testing.
2. Once BUG-01–04 are addressed and merged to `main`, QA will resume to cover: Sections 3–10 (all authenticated flows); Section 1 data-dependent checks (#36 product images, #37 logos, #38 deal cards, which require created suppliers/products/deals); and Sections 11–13 (full i18n sweep, responsive breakpoints, console hygiene on authenticated routes).
3. Each bug is filed as a child issue linked to #52 ("Part of #52").