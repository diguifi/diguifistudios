# Diguifi Studios Frontend Implementation Plan

## Summary
- Bootstrap a new `React + Vite + TypeScript` frontend for GitHub Pages.
- Present the existing `diguifi.itch.io` catalog as a modern portfolio backed by local JSON.
- Implement Google OAuth session plumbing against the backend auth endpoints.
- Prepare a minimal authenticated storefront with one mock product and Stripe-ready checkout contract.

## Key Changes
- Home page with hero, featured release, game grid, and side-panel details for each catalog entry.
- Auth provider that integrates with:
  - `POST /api/auth/google`
  - `POST /api/auth/refresh`
  - `POST /api/auth/logout`
  - `GET /api/auth/me`
- Store page with mock checkout request to `POST /api/produto/checkout-session`.
- Shared API client and environment configuration for the live backend integration.
- Test setup with `Vitest + Testing Library`.
- GitHub Actions pipeline for `typecheck`, `test`, `build`, and GitHub Pages deployment.

## Test Scenarios
- Home renders the catalog and opens game details.
- Session refresh hydrates the authenticated user.
- Session refresh failure falls back to anonymous state.
- Logout clears the local user state.
- Anonymous checkout is blocked.
- Authenticated checkout calls the backend contract and shows success feedback.

## Assumptions
- The backend handles token storage and CORS for the deployed GitHub Pages domain.
- The Google redirect flow lands on the frontend callback route and then finalizes login via `POST /api/auth/google`.
- The initial catalog remains local JSON for this version.
