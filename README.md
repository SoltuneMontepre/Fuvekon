[![fuvekon CD](https://github.com/SoltuneMontepre/Fuvekon/actions/workflows/cd.yaml/badge.svg?branch=main)](https://github.com/SoltuneMontepre/Fuvekon/actions/workflows/cd.yaml) [![fuvekon CI](https://github.com/SoltuneMontepre/Fuvekon/actions/workflows/ci.yaml/badge.svg)](https://github.com/SoltuneMontepre/Fuvekon/actions/workflows/ci.yaml)

## Overview

This document expands the basic steps to get Fuvekon running locally and adds a short explanation of the repository's `src/` layout.

## Environment setup

### Requirements

- Node 18 | >= 24.3 [[Download here]](https://nodejs.org/en/download)

### Steps:

#### 1. Install dependencies

```bash
npm i
```

#### 2. Create environment variables:

Clone `.env.example` to `.env` using the following command:

Windows (PowerShell):

```pwsh
Copy-Item .env.example .env
```

#### 3. Start the development server

```bash
npm run dev
```

#### 4. Start coding!

Congratulations — onboarding complete.

---

## Repo Quickstart:

### 1. Project file structure (src/)

Below is the `src/` folder structure and a short explanation of each top-level folder and notable files. This helps contributors quickly find where code lives and what each area is responsible for.

src/

- `app/` — Next.js app routes and pages

  - `globals.css` — global styles used by the app
  - `layout.tsx` — top-level layout for the app
  - `not-found.tsx` — custom 404 / not found page
  - `about/`, `contributes/`, `ticket/` — route folders with their pages and sub-routes

- `common/` — small shared utilities and configuration

  - `axios.ts` — axios HTTP client wrapper/config
  - `gsap.ts` — GSAP animation setup (if used)
  - `language.ts` — language helpers or mapping

- `components/` — React components grouped by purpose

  - `animated/` — animation wrapper component
  - `auth/` — auth UI controls
  - `common/` (FuveIcon.tsx, Loading.tsx, Pagination.tsx, SearchBar.tsx) — shared UI primitives
  - `config/` (DarkModeToggle.tsx, LanguageSelector.tsx, LanguageSwitcher.tsx) — sitewide config controls
  - `landing/` — hero and landing-specific components
  - `nav/` — navigation components (NavBar, NavButtons)

- `config/` — application-level config and providers

  - `app.ts` — app configuration constants
  - `language.ts` — language configuration (supported locales, defaults)
  - `Providers/` — React providers wrappers
    - `TanstackProvider.tsx` — react-query tanstack provider setup
    - `ThemePreload.tsx` — theme preloading logic
    - `ThemeProvider.tsx` — theme context/provider implementation

- `hooks/` — custom React hooks

  - `common/` (usePagination.ts, useSearch.ts) — reusable hooks across app
  - `config/` useLanguage.ts — language selection hook
  - `interactions/` (useCopyToClipboard.ts, useDebounce.ts, useDebouncedSearch.ts) — interaction utilities
  - `services` API calls hooks (Tanstack Wrappers)

- `language/` — translations/locales

- `stores/` — small global state stores

  - `themeStore.ts` — theme state (e.g., using Zustand or similar)

- `types/` — TypeScript type definitions for API and models

  - `api/` — types for API request/response shapes (error, auth, ticket)
  - `models/` — domain models (auth account, credentials, roles, ticket/event/payment types)

- `utils/` — utility functions
  - `getQueryClient.ts` — helper to create/query client instance
  - `pagination.ts` — pagination utilities
  - `params/` — query param helpers (buildUrlWithParams, mergeQueryParams, pageParams, pageSearchKey, setParams)
  - `validation/` — validation helpers (idValidation.ts)

### 2. Creating a new feature:

//here

## Dev Flow

### 1. Create a feature branch (naming convention)

Use descriptive, hyphen-separated branch names that include the type and (optionally) an issue/ticket id:

- Pattern: <type>/<issue-?id>-short-description
- Types: feat, fix, chore, docs, refactor, perf, test

Examples:

```bash
git checkout -b feat/ticket-123-add-login
git checkout -b fix/auth-456-handle-token-expiry
git checkout -b chore/setup-ci
```

Notes:

- Keep the short-description concise (max 3–6 words).
- Use lowercase and hyphens; avoid spaces and special chars.

### 2. Commit using the repository's commit convention and push

Follow Conventional Commits: type(scope?): short description

- Types: feat, fix, chore, docs, refactor, perf, test
- Scope is optional (module or file area)

Examples:

```bash
# with scope
git add .
git commit -m "feat(auth): add login form and validation"
git push --set-upstream origin feat/ticket-123-add-login

# without scope
git commit -m "fix: handle expired token in api client"
git push origin fix/auth-456-handle-token-expiry
```

Good commit message examples:

- feat(ui): add dark mode toggle
- fix(api): retry on 429 rate limit
- docs(readme): clarify setup steps for Windows

Tips:

- Write short imperative sentences.
- Reference issue IDs in the commit body if needed.

### 3. Open a PR linking the relevant issue and follow the repo's review checklist

PR Title:

- Use the same convention as commits: `type(scope): short description`
- Example: `feat(auth): add login form (closes #123)`

PR Description Template (copy into the PR description):

- Summary: one-paragraph summary of the change.
- Related issue(s): Closes #<id> or relates to #<id>.
- Changes:
  - Bullet list of notable changes.
- How to test:
  1. Steps to reproduce or verify locally.
  2. Commands (e.g., npm run dev, sample requests).
- Screenshots / GIFs: (if UI changes)
- Migration / Backwards-compatibility notes: (if any)

Reviewers & Labels:

- Request 1–2 reviewers familiar with the area.
- Add labels (feat, bug, docs) and milestone if applicable.

Merging:

- Ensure CI checks pass and approvals are in place before merging.
- Use "Squash and merge" or follow repo's merge strategy (documented in CONTRIBUTING).

### Example PR flow:

#### 1. Push branch:

```bash
git push --set-upstream origin feat/ticket-123-add-login
```

#### 2. Open PR using title:

```
feat(auth): add login form (closes #123)
```

#### 3. Paste the PR description template, run CI, request reviewers, and address feedback.

This provides clear, consistent branch/commit/PR naming and examples for contributors.
