# AGENTS.md

This repository has a frontend (Vite + React) and a backend (Fastify + Drizzle).
Use this guide for commands and code style expectations when contributing.

## Repository Layout
- `App/frontend`: Vite React app (TypeScript, Tailwind).
- `App/backend`: Fastify API + WhatsApp bot (TypeScript, ESM).

## Install Commands
- Frontend deps: `npm --prefix App/frontend install`
- Backend deps: `npm --prefix App/backend install`

## Build / Lint / Test

### Frontend (Vite)
- Dev server: `npm --prefix App/frontend run dev`
- Build: `npm --prefix App/frontend run build`
- Lint: `npm --prefix App/frontend run lint`
- Preview build: `npm --prefix App/frontend run preview`

### Backend (Fastify)
- Start (watch): `npm --prefix App/backend run start`
- Migrations generate: `npm --prefix App/backend run drizzle:generate`
- Migrate: `npm --prefix App/backend run migrate`
- Reset DB (docker compose + migrate): `npm --prefix App/backend run reset`

### Tests
- No test runner is configured in either package at the moment.
- There is no single-test command available yet.

## Configuration Notes
- Frontend env vars must be prefixed with `VITE_` and accessed via
  `import.meta.env`.
- Backend uses `process.env` and ESM imports with `.js` extensions.
- Frontend TypeScript strictness is enforced by `tsconfig.app.json`.
- Backend TypeScript strictness is enforced by `App/backend/tsconfig.json`.

## Frontend Code Style

### General
- TypeScript only; keep types explicit at component boundaries.
- Prefer functional components and React hooks.
- Use `@/` alias for imports from `App/frontend/src`.
- Keep JSX readable; split large blocks into smaller components.

### Imports
- Order: external libraries, then internal modules, then styles/assets.
- Prefer named imports; avoid default exports unless file already uses them.
- Use absolute alias paths over deep relative paths when possible.

### Formatting
- Use double quotes and semicolons (match existing files).
- Follow ESLint config in `App/frontend/eslint.config.js`.
- Avoid unused locals/params (TS config enforces this).

### State and Data
- Use `useState`/`useMemo`/`useEffect` with clear dependency arrays.
- Avoid side effects in render; keep fetch logic inside hooks.
- Use `@tanstack/react-query` for server state when possible.

### UI / Tailwind
- Use Tailwind utility classes for styling.
- Prefer composing class names with `cn` helper where it is already used.
- Ensure mobile-friendly spacing and tap targets for buttons.
- Treat frontend UI as mobile-first; design layouts for small screens first.

### Error Handling
- Provide user-visible messages for loading/error states.
- Guard against `undefined` data from API responses.

## Backend Code Style

### General
- TypeScript strict mode; keep types explicit in services and routes.
- Use ESM imports with `.js` extensions for local files.
- Favor named exports; keep file responsibilities focused.

### Structure
- Routes: `App/backend/src/routes/*` for Fastify route registration.
- Services: `App/backend/src/services/*` for data/logic.
- AI intent flow: `App/backend/src/ai/*` for classifiers and nodes.
- DB schema: `App/backend/src/db/*` (Drizzle).

### Formatting
- Use double quotes and semicolons (match backend style).
- Keep line length reasonable; break long objects across lines.

### Error Handling
- Wrap async handlers with `try/catch` when doing I/O.
- Log errors with Fastify logger when available.
- Return consistent error messages for API clients.

## Naming Conventions
- Components: `PascalCase`.
- Hooks and functions: `camelCase`.
- Constants: `SCREAMING_SNAKE_CASE` only for true constants.
- Types/interfaces: `PascalCase`.
- File names: `kebab-case` or `camelCase` as already used in folder.

## Data and Types
- Keep API response types close to their usage (page or service module).
- Use optional chaining and nullish coalescing for nullable fields.
- Normalize numbers before calculations to avoid `NaN`.

## Agentic Notes
- No Cursor or Copilot rule files were found in this repo.
- Keep changes scoped; avoid refactors unless requested.
- Do not introduce new tooling without asking.
