# WDIS — Ecommerce Store

A headless ecommerce store built with **Next.js 15** and **Medusa.js v2**, with
**Stripe** payments. Runs as a Docker Compose stack on a single VPS behind
Caddy (automatic HTTPS).

---

## Architecture

```
                    ┌───────────────────── VPS (docker compose) ─────────────────────┐
                    │                                                                 │
  https://DOMAIN ───┼──►  Caddy  ──►  storefront (Next.js :3000)                      │
                    │       │              │  server-side calls (internal network)    │
  https://api.DOMAIN┼───────┴──────►  medusa (API + admin /app :9000)                 │
                    │                       │                                         │
                    │                 postgres :5432      redis :6379                 │
                    └─────────────────────────────────────────────────────────────────┘
```

| Concern                                    | Where it lives                           |
| ------------------------------------------ | ---------------------------------------- |
| Products, variants, pricing, cart, orders  | Medusa                                   |
| Payments                                   | Medusa Stripe provider + Stripe Elements |
| Customer accounts                          | Medusa emailpass auth, via NextAuth      |
| Home calendar, hero carousel, seasons      | Custom Medusa modules (edited in admin)  |
| Product images                             | Medusa local file storage (`/static`)    |

Only Caddy is exposed to the internet (ports 80/443). Postgres, Redis, Medusa
and Next.js talk over the private Compose network.

## Tech Stack

- **Storefront:** Next.js 15 (App Router, ISR), React 19, TypeScript, Tailwind CSS 3, Framer Motion, Zustand
- **Commerce backend:** Medusa.js v2 (PostgreSQL 16, Redis 7)
- **Payments:** Stripe (Payment Element; Apple Pay / Google Pay / Link via automatic payment methods)
- **Auth:** NextAuth (credentials) backed by Medusa customer auth
- **Infra:** Docker Compose, Caddy, npm workspaces + Turborepo

## Project Structure

```
.
├── apps/
│   ├── storefront/            # Next.js storefront
│   │   ├── src/app/           # Routes: home, products, art, cart, checkout, account, login/signup
│   │   ├── src/components/    # UI, layout, product, cart, home, art, season
│   │   ├── src/lib/medusa/    # Store API client
│   │   └── Dockerfile
│   └── medusa-backend/        # Medusa v2 backend
│       ├── src/modules/       # calendar, carousel, season (custom modules + migrations)
│       ├── src/api/           # Custom admin + store API routes
│       ├── src/admin/routes/  # Admin dashboard pages (art, calendar, carousel, seasons)
│       ├── src/subscribers/   # Event subscribers
│       ├── src/scripts/       # seed, seed-art, seed-shipping, setup-checkout
│       ├── medusa-config.ts
│       └── Dockerfile
├── packages/
│   ├── types/                 # Shared TypeScript types
│   └── config/                # Shared tsconfig / eslint
├── deploy/                    # Caddyfile + server setup, deploy and backup scripts
├── docker-compose.yml         # Local dev: Postgres, Redis, Medusa
├── docker-compose.prod.yml    # Production stack
└── .env.production.example    # Production settings template
```

---

## Local Development

**Prerequisites:** Node.js 20 (see `.nvmrc`), npm 10+, Docker, a Stripe account.

```bash
npm install

# Env files
cp apps/medusa-backend/.env.example apps/medusa-backend/.env
cp apps/storefront/.env.example apps/storefront/.env.local

# Postgres + Redis
docker compose up -d postgres redis

# Database
cd apps/medusa-backend
npm run db:migrate
npm run seed              # regions, sales channel, stock location, demo products
npm run setup:checkout    # Stripe on regions + shipping options
npx medusa user -e admin@example.com -p supersecret
cd ../..

# Run everything
npm run dev
```

- Storefront: http://localhost:3000
- Medusa API: http://localhost:9000
- Medusa admin: http://localhost:9000/app

After the first run, create a publishable key in the admin
(Settings → Publishable API Keys), put it in both `*_PUBLISHABLE_KEY`
variables in `apps/storefront/.env.local`, and restart the storefront.

For local Stripe webhooks: `cd apps/medusa-backend && npm run stripe:listen`,
then copy the printed signing secret into `STRIPE_WEBHOOK_SECRET`.

### Scripts

```bash
npm run dev          # Start all apps (turbo)
npm run build        # Build all apps
npm run lint         # Lint
npm run type-check   # TypeScript checks
```

Backend (`apps/medusa-backend`): `db:migrate`, `migrations:generate`, `seed`,
`seed:art`, `setup:checkout`, `stripe:listen`.

---

## Deployment (VPS)

The whole stack runs from `docker-compose.prod.yml` on one Ubuntu 24.04 VPS
(4 GB RAM). Caddy terminates HTTPS; the store is served at `https://DOMAIN` and
Medusa (API + admin at `/app`) at `https://api.DOMAIN`.

1. **DNS** — point `DOMAIN`, `www.DOMAIN` and `api.DOMAIN` (A records) at the VPS IP.
2. **Server setup** (as root, once): `bash deploy/setup-server.sh` — Docker,
   firewall, swap, automatic updates, daily backups.
3. **Clone and configure**:
   ```bash
   git clone https://git.altusanimi.dev/jurizar/wdis_production.git /opt/wdis && cd /opt/wdis
   cp .env.production.example .env.production   # fill in; secrets: openssl rand -base64 32
   bash deploy/deploy.sh
   ```
   Leave `MEDUSA_PUBLISHABLE_KEY` empty on this first run. Migrations run
   automatically when the Medusa container starts.
4. **Create an admin user and seed the store**:
   ```bash
   COMPOSE="docker compose -f docker-compose.prod.yml --env-file .env.production"
   $COMPOSE exec medusa npx medusa user -e you@example.com -p '<strong-password>'
   $COMPOSE exec medusa npx medusa exec ./src/scripts/seed.js            # regions, sales channel, stock location
   $COMPOSE exec medusa npx medusa exec ./src/scripts/setup-checkout.js  # Stripe + shipping options
   ```
5. **Publishable key** — sign in at `https://api.DOMAIN/app`, go to
   Settings → Publishable API Keys, copy the key (linked to your sales channel)
   into `MEDUSA_PUBLISHABLE_KEY`, then run `bash deploy/deploy.sh` again. The
   storefront bakes this key in at build time, so every change needs a rebuild.
6. **Stripe webhook** — in the Stripe dashboard add the endpoint
   `https://api.DOMAIN/hooks/payment/stripe_stripe`, put its signing secret in
   `STRIPE_WEBHOOK_SECRET`, and redeploy.

Use Stripe test keys (`pk_test_` / `sk_test_`) until a full test order goes
through, then switch to live keys and redeploy.

### Updating

Push to the repo, then on the server:

```bash
cd /opt/wdis && bash deploy/deploy.sh
```

### Backups

`deploy/backup.sh` runs daily at 03:30 (cron, installed by `setup-server.sh`)
and writes the database dump and uploaded images to `/opt/wdis/backups`,
keeping 14 days. Copy them off the server regularly. Restore instructions are
at the top of `deploy/backup.sh`.

---

## Troubleshooting

**Storefront shows no products** — the publishable key is missing or not
linked to the sales channel your products are in. Fix it in the admin, update
the env, and rebuild the storefront.

**CORS errors** — `STORE_CORS` / `AUTH_CORS` must match the storefront URL
exactly (scheme and host, no trailing slash).

**Checkout has no shipping options** — run the `setup-checkout` script; it is
safe to re-run.

**Logs** — `docker compose -f docker-compose.prod.yml --env-file .env.production logs -f medusa storefront`

---

## License

MIT
