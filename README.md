[![fuvekon CD](https://github.com/SoltuneMontepre/Fuvekon/actions/workflows/cd.yaml/badge.svg?branch=main)](https://github.com/SoltuneMontepre/Fuvekon/actions/workflows/cd.yaml) [![fuvekon CI](https://github.com/SoltuneMontepre/Fuvekon/actions/workflows/ci.yaml/badge.svg)](https://github.com/SoltuneMontepre/Fuvekon/actions/workflows/ci.yaml)

## Overview

This document expands the basic steps to get the fuvekon running locally. Each step below preserves the original items and adds brief explanations and copy-paste commands where applicable.

## Environment setup

### Requirements

- Node 18 | >= 24.3 [[Download here]](https://nodejs.org/en/download)

### Steps

#### 1. Install dependencies

```bash
npm i
```

#### 2. Create environment variables

Clone `.env.example` to `.env` using the following command:

Unix/macOS:

```bash
cp .env.example .env
```

Windows (PowerShell):

```pwsh
Copy-Item .env.example .env
```

Windows (CMD):

```cmd
copy .env.example .env
```

#### 3. Start the development server

```bash
npm run dev
```

#### 4. Start coding

Congratulations — onboarding complete.

## Repo Quickstart

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

### 2. Creating a new feature

This section describes a recommended, repeatable flow for adding a new feature to the app. It focuses on small, well-typed steps:

- Create types (models + API shapes)
- Create API functions and TanStack Query hooks that use the project's axios wrapper
- Create the page(s) and route(s) in the `app/` router
- Wire translations and the page to the API
- Split UI into components under `components/`
- Put helper functions in `utils/` when appropriate

Below are concrete guidelines and small examples you can copy.

#### 1. Create types

- Organize types under `src/types/`:

  - `types/models/` — the in-app domain model types that reflect business logic (what your React components and services work with).
  - `types/api/` — types describing request/response payloads for the backend API.

- Use Zod for validation on the client for request bodies only (validate outgoing payloads). Responses from the server should be typed in TypeScript but don't need runtime validation here unless you expect untrusted payloads — validate on the server or add selective response checks when necessary. Example pattern for request schema:

```ts
// src/types/models/item.ts
export type Item = {
	id?: string
	title: string
	description?: string
	createdAt?: string
}
```

```ts
// src/types/api/item.ts
import { z } from 'zod'
import type { Item } from '@types/models/item'
import type { Error } from '@types/api/error'

export const CreateItemSchema = z.object({
	title: z.string().min(1),
	description: z.string().optional(),
})

export type CreateItemRequest = z.infer<typeof CreateItemSchema>

export type GetItemsResponse = Item[] | Error

export type GetItemById = Item | Error
```

Notes:

- Keep `models` simple — they represent what your UI and domain code consume.
- Keep `api` types close to server contracts; use Zod to validate responses when helpful.

#### 2. Create the API layer (axios + TanStack Query hooks)

- Use the existing `src/common/axios.ts` axios instance. Create small HTTP functions that call axios and return typed data.

Notes about layering: in this repo we prefer a thin approach — the TanStack Query hook can call the configured `axios` instance directly rather than introducing an extra HTTP wrapper file. Keep the axios instance in `src/common/axios.ts` for shared concerns (baseURL, interceptors, auth). Example hooks that directly use axios:

```ts
// src/hooks/api/useItems.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'src/common/axios'
import type { CreateItemRequest, Item } from 'src/types/api/item'

export const useItems = () => {
	return useQuery<Item[]>(['items'], async () => {
		const { data } = await axios.get('/items')
		return data
	})
}

export function useCreateItem() {
	const qc = useQueryClient()
	return useMutation(
		async (payload: CreateItemRequest) => {
			const { data } = await axios.post<Item>('/items', payload)
			return data
		},
		{
			onSuccess: () => qc.invalidateQueries(['items']),
		}
	)
}
```

Tips:

- Keep the axios wrapper in `src/common/axios.ts` responsible for baseURL, interceptors, auth headers and error handling.
- Make HTTP functions small and typed, then make hook wrappers thin.

#### 3. Create the page and routes

- Normal route (list view): create `app/items/page.tsx` to show a list of items.
- Dynamic route (item details): create `app/items/[id]/page.tsx` for an item details page.
- Catch-all / optional catch-all routes: use `[...slug]` or `[[...slug]]` when needed.
- Route groups: use parentheses to group routes (for layouts or logical grouping) without adding a URL segment, e.g. `app/(auth)/login/page.tsx`.

Special files in the App Router:

- `page.tsx` — renders the route UI (required for a route).
- `layout.tsx` — shared layout for a route subtree.
- `loading.tsx` — shown while a parent or child segment is loading (suspense-friendly).
- `error.tsx` — error boundary UI for the segment subtree.
- `not-found.tsx` — route for 404 within a segment.
- `route.ts` — HTTP-only server handlers (if you want to implement server API endpoints in the app folder).

Example structure:

```
app/
  items/
    page.tsx          // /items
    loading.tsx
    (ui-layout)/
    [id]/
      page.tsx        // /items/:id
```

Note: Next.js supports dynamic ([id]), catch-all ([...slug]) and optional-catch-all ([[...slug]]) segments. Route groups (parentheses) let you share layouts or organize code without changing URLs.

#### 4. Wire the page to the API and translations

- On the page component, use the TanStack Query hooks you created (`useItems`, `useCreateItem`) to read and mutate data.
- Use `next-intl`'s `useTranslations` for component/page translations and keep your message keys in `src/language/*.json` (the repo already contains `en.json`, `th.json`, `vi.json`, `zh.json`). `useTranslations(namespace)` returns a function `t(key)` that maps to keys in the JSON files. Example:

```json
// src/language/en.json (excerpt)
{
	"nav": {
		"register": "Register",
		"contributes": "Contributes",
		"about": "About"
	},
	"items": {
		"title": "Items"
	}
}
```

Usage example with `next-intl` in a small nav component (similar to `src/components/nav/NavButtons.tsx`):

```tsx
import { useTranslations } from 'next-intl'

function NavButtons() {
	const t = useTranslations('nav')
	return <a>{t('register')}</a>
}
```

Notes:

- `useTranslations('nav')` maps the `nav` object in your JSON language files; `t('register')` returns the localized string.
- Keep translation keys small and organized by namespace (for pages, components, or features).

Example page using hooks and translations:

```tsx
// app/items/page.tsx
import React from 'react'
import { useItems, useCreateItem } from 'src/hooks/api/useItems'
import { useTranslations } from 'next-intl'
import ItemList from 'src/components/items/ItemList'

export default function ItemsPage() {
	const { data: items, isLoading } = useItems()
	const createItem = useCreateItem()
	const t = useTranslations('items')

	if (isLoading)
		return (
			<div>
				{
					t(
						'loading'
					) /* key should exist in src/language/<locale>.json -> items.loading */
				}
			</div>
		)

	return (
		<main>
			<h1>{t('title')}</h1>
			<ItemList items={items ?? []} onCreate={p => createItem.mutate(p)} />
		</main>
	)
}
```

Notes:

- Keep data-fetching in hooks and business logic outside of UI components so components remain small and testable.
- Use `loading.tsx` and `error.tsx` files for UX during suspense or boundary errors.

#### 5. Split components into `components/`

- Create a small component surface for the feature inside `src/components/`:
  - `src/components/items/ItemList.tsx` — renders the list and delegates each item to `ItemCard`.
  - `src/components/items/ItemCard.tsx` — single item display.
  - `src/components/items/ItemForm.tsx` — controlled form for create/edit (validate with Zod client-side).

Example path suggestions:

```
src/components/items/ItemList.tsx
src/components/items/ItemCard.tsx
src/components/items/ItemForm.tsx
```

#### 6. Put helpers in `utils/` when applicable

- Reusable helpers used by API hooks or UI (e.g., pagination helpers, param builders, form helpers) belong in `src/utils/`.
- If an HTTP helper is specific to the feature, put it under `src/utils/api/<feature>.ts` or `src/utils/<feature>.ts`.

Example utility placements:

- `src/utils/api/items.ts` (HTTP functions)
- `src/utils/pagination.ts` (page math and query param builders)

#### 7. Quick checklist (practical)

- [ ] Add Zod schemas in `src/types/api` and export TS types
- [ ] Add HTTP functions in `src/utils/api` that use `src/common/axios.ts`
- [ ] Add TanStack Query hooks in `src/hooks/api` for queries/mutations
- [ ] Add UI components in `src/components/<feature>`
- [ ] Add pages in `app/<feature>/page.tsx` and `app/<feature>/[id]/page.tsx` as needed
- [ ] Use existing translation helpers (`src/hooks/config/useLanguage` or `src/common/language`) to call translations in the page
- [ ] Add `loading.tsx` and `error.tsx` if UX needs them during data fetch or error

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

### Example PR flow

#### 1. Push branch

```bash
git push --set-upstream origin feat/ticket-123-add-login
```

#### 2. Open PR using title

```
feat(auth): add login form (closes #123)
```

#### 3. Paste the PR description template, run CI, request reviewers, and address feedback

This provides clear, consistent branch/commit/PR naming and examples for contributors.
