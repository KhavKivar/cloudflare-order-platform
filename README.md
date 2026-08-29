# Cloudflare Order Platform

A full-stack order and purchasing workspace designed for Cloudflare's developer platform. It pairs a React operations dashboard with a Hono API, D1 persistence, and Drizzle schemas and migrations.

## Capabilities

- Customer and product management
- Order creation, editing, and status tracking
- Purchase-order composition and summaries
- Sales metrics and operational dashboards
- Typed request validation with Zod
- Cloudflare D1 persistence through Drizzle ORM

## Architecture

```text
app/frontend/  React 19, Vite, React Router, TanStack Query
app/backend/   Hono Cloudflare Worker, D1, Drizzle ORM
```

## Local development

Requirements: Node.js 20+, pnpm, and Wrangler.

Backend:

```bash
cd app/backend
pnpm install
pnpm db:migrate:local
pnpm dev-local
```

Frontend, in a second terminal:

```bash
cd app/frontend
pnpm install
pnpm dev-local
```

The local API listens on `http://localhost:8787`; Vite prints the frontend URL when it starts.

## Validation

```bash
cd app/backend && pnpm typecheck
cd app/frontend && pnpm lint && pnpm build
```

Cloudflare account credentials and production environment values are intentionally excluded.
