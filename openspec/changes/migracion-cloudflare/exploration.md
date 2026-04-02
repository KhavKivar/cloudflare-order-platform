## Exploration: migracion-cloudflare

### Current State
- The frontend is a standard Vite + React application, currently configured for deployment on Vercel (`vercel.json` exists).
- The frontend is a standard Vite + React application.
- The backend will be migrated from Fastify to **Hono**, targeting **Cloudflare Workers**.
- Data persistence will migrate from PostgreSQL to **Cloudflare D1 (SQLite)** using Drizzle ORM.
- **WhatsApp integration (Baileys) is being removed from the project.**

### Affected Areas
- `app/backend/` — Fully migrated to Hono and deployed on Cloudflare Workers.
- `app/backend/src/db/` — Migrated to `drizzle-orm/d1` with SQLite schemas.
- `app/frontend/` — Deployed on Cloudflare Pages.
- `app/frontend/` — Needs adaptation to deploy on Cloudflare Pages (typically modifying the build scripts or using `@cloudflare/vite-plugin`).

### Approaches
1. **Full Cloudflare Stack (Hono + D1 + Pages)**: Deploy the entire application on Cloudflare. The Hono backend runs on Workers, the frontend on Pages, and data is stored in D1.
   - Pros: Maximum performance, edge execution, zero cold starts (with Lite tiers), unified developer experience (Wrangler).
   - Cons: Requires minor schema adjustments for SQLite.
   - Effort: Medium

2. **Hybrid Migration (Pages for Web, VPS/Container for Backend)** — Move frontend to Cloudflare Pages, keep backend on a Docker container / VPS since `baileys` requires a Node.js persistent runtime.
   - Pros: Trivial frontend migration (Vite builds statically). Backend remains stable with its Node.js and Postgres reliance.
   - Cons: Infrastructure remains split (CF + VPS).
   - Effort: Low

3. **Backend via Cloudflare Tunnels (cloudflared)** — Host backend locally/VPS but route all traffic securely through Cloudflare Tunnels to a Cloudflare Domain, while deploying the frontend on Pages.
   - Pros: Backend stays Node.js, get CF DDoS protection and CDN.
   - Cons: Still managing your own server for the backend.
   - Effort: Low/Medium

### Recommendation
Option 1 (Full Cloudflare Stack). Since Baileys is removed, we no longer need a persistent Node.js runtime. We can leverage the full power of Cloudflare Workers and D1.

### Risks
- SQLite/D1 limitations compared to PostgreSQL (though minimal for this use case).
- Cold starts (though Hono/Workers are very fast).

### Ready for Proposal
Yes. The proposal will outline the Hybrid approach.
