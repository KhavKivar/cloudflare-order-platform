# Proposal: Cloudflare Migration (migracion-cloudflare)

## Intent

Migrate appropriate components of the OrderSapp infrastructure to Cloudflare to improve global latency, reduce hosting costs, and simplify frontend deployments, while acknowledging the backend limitations imposed by the stateful `baileys` WhatsApp integration.

## Scope

### In Scope
- Migrate the `app/frontend` (Vite + React) deployment pipeline from Vercel to Cloudflare Pages.
- Migrate database from PostgreSQL (Docker) to Cloudflare D1 (SQLite) using Drizzle ORM.
- **Rewrite the backend API from Fastify to Hono and deploy to Cloudflare Workers.**
- **Remove all Baileys/WhatsApp related code and dependencies.**

### Out of Scope
- Porting stateful Node.js logic (Baileys) - this feature is being deprecated/removed.

## Approach

**Full Cloudflare Stack Migration**:
We will leverage high-performance edge computing by deploying the **Hono** backend to **Cloudflare Workers** and the frontend to **Cloudflare Pages**. Data will be stored in **Cloudflare D1** (SQLite) via **Drizzle ORM**.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `app/frontend/vercel.json` | Removed/Modified | Vercel specific settings to be transitioned |
| `app/frontend/package.json` | Modified | Add `wrangler` deployment script if required |
| `app/backend/` | Refactored | Rewrite as Hono Worker, remove Baileys dependencies |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Database migration data loss | Low | Perform thorough migration testing with Drizzle Kit. |
| Workers resource limits | Low | Keep dependencies lean by removing Baileys/Fastify bloat. |

## Rollback Plan

For the frontend: leave Vercel deployment active and point DNS back to Vercel CNAME if the Cloudflare Pages build or routing fails.

## Dependencies

- A Cloudflare account and configured domain.
- `wrangler` CLI configured for deployment.

## Success Criteria

- [ ] Backend successfully runs on Cloudflare Workers and interacts with D1.
- [ ] Frontend successfully deploys and loads via Cloudflare Pages.
- [ ] WhatsApp bot logic is completely removed and system remains functional.
- [ ] Frontend can communicate with the stateful API securely.
- [ ] WhatsApp bot continues to operate normally on its Node.js environment.
