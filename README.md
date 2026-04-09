# URBN — Premium Ecommerce Store

A production-ready ecommerce storefront built with **Next.js 15**, **Medusa.js v2**, **Convex**, and **Stripe**. Features a bold, urban design aesthetic with smooth animations, real-time inventory, and a scalable monorepo architecture.

---

## 🚀 Quick Start

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** >= 20.0.0
- **npm** >= 10.0.0
- **Docker** & **Docker Compose** (for local database and Redis)
- **Git**

You'll also need accounts for:
- **Stripe** ([stripe.com](https://stripe.com)) - for payment processing
- **Convex** ([convex.dev](https://convex.dev)) - for real-time features

### 1. Clone the Repository

```bash
git clone https://github.com/Jourizar/medusa_ecommerce_wdis.git ecommerce-store
cd ecommerce-store
```

### 2. Install Dependencies

```bash
npm install
```

This will install all dependencies for the monorepo (storefront, medusa-backend, and shared packages).

### 3. Configure Environment Variables

#### Frontend (.env.local)

Create the frontend environment file:

```bash
cd apps/storefront
cp .env.example .env.local
```

Edit `apps/storefront/.env.local`:

```env
NEXT_PUBLIC_MEDUSA_BACKEND_URL=http://localhost:9000
NEXT_PUBLIC_CONVEX_URL=https://your-project.convex.cloud
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_key
JWT_SECRET=<generate-with:-openssl-rand--base64-32>
NEXTAUTH_SECRET=<generate-with:-openssl-rand--base64-32>
NEXTAUTH_URL=http://localhost:3000
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

#### Medusa Backend (.env)

Create the backend environment file:

```bash
cd apps/medusa-backend
cp .env.example .env
```

Edit `apps/medusa-backend/.env`:

```env
DATABASE_URL=postgresql://medusa:medusa_password@localhost:5432/medusa
REDIS_URL=redis://localhost:6379
MEDUSA_BACKEND_URL=http://localhost:9000
JWT_SECRET=<same-as-frontend>
COOKIE_SECRET=<generate-random-string>
STORE_CORS=http://localhost:3000
ADMIN_CORS=http://localhost:5173,http://localhost:9000
AUTH_CORS=http://localhost:3000
STRIPE_API_KEY=sk_test_your_stripe_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
CONVEX_URL=https://your-project.convex.cloud
CONVEX_ADMIN_KEY=your_convex_admin_key
```

> **Note:** Generate secure secrets using:
> ```bash
> # Windows (PowerShell)
> [Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
> 
> # Linux/Mac
> openssl rand -base64 32
> ```

### 4. Start Infrastructure (PostgreSQL & Redis)

From the project root, start Docker Compose:

```bash
docker compose up -d
```

This will start:
- **PostgreSQL** on port 5432
- **Redis** on port 6379
- **Medusa Backend** on port 9000

Wait for the services to be healthy (usually ~30 seconds for first setup).

### 5. Run Database Migrations

```bash
cd apps/medusa-backend
npm run migrations:run
cd ../..
```

### 6. Seed Initial Data (Optional)

Populate your store with sample products and data:

```bash
cd apps/medusa-backend
npm run seed
cd ../..
```

### 7. Setup Convex (Real-time Features)

From the storefront directory, initialize Convex:

```bash
cd apps/storefront
npx convex dev
```

This will:
- Prompt you to login/create a Convex project
- Deploy your Convex schema
- Start the Convex dev server

### 8. Start the Development Server

From the project root:

```bash
npm run dev
```

This starts all applications concurrently using Turborepo:
- **Storefront:** http://localhost:3000
- **Medusa Backend:** http://localhost:9000
- **Medusa Admin:** http://localhost:5173 (auto-opened)

---

## 🏗️ Architecture

```
┌──────────────────┐       HTTPS/REST       ┌──────────────────┐
│   Next.js 15     │◄──────────────────────►│   Medusa.js v2   │
│   (Storefront)   │                        │   (Commerce)     │
│   - App Router   │                        │   - Products     │
│   - RSC + SSR    │                        │   - Carts        │
│   - Tailwind v4  │                        │   - Orders       │
│   - Framer Motion│                        │   - Stripe       │
└────────┬─────────┘                        └────────┬─────────┘
         │                                           │
   WebSocket/WSS                              PostgreSQL + Redis
         │
┌────────┴─────────┐
│   Convex         │
│   (Real-time)    │
│   - Inventory    │
│   - Analytics    │
│   - Wishlist     │
│   - Notifications│
└──────────────────┘
```

### Service Boundaries

| Domain | Service |
|---|---|
| Products, variants, pricing | Medusa.js |
| Cart, checkout, orders | Medusa.js |
| Payment processing | Medusa.js + Stripe |
| Real-time inventory | Convex (synced from Medusa) |
| Analytics & events | Convex |
| User profiles, wishlist | Convex |

---

## Tech Stack

- **Frontend:** Next.js 15 (App Router), TypeScript, Tailwind CSS v4, Framer Motion
- **Commerce Backend:** Medusa.js v2
- **Real-time Data:** Convex
- **Payments:** Stripe
- **Auth:** NextAuth.js + JWT (Medusa customer auth)
- **State Management:** Zustand (cart)
- **Monorepo:** Turborepo + npm workspaces
- **Deployment:** Vercel (frontend), Railway/Docker (Medusa), Convex Cloud

---

## Getting Started

### Prerequisites

- Node.js >= 20
- npm >= 10
- Docker & Docker Compose (for local Medusa development)
- A Convex account ([convex.dev](https://convex.dev))
- A Stripe account ([stripe.com](https://stripe.com))

### 1. Clone & Install

```bash
git clone <your-repo-url> ecommerce-store
cd ecommerce-store
npm install
```

### 2. Configure Environment Variables

**Frontend** (`apps/storefront/.env.local`):
```env
NEXT_PUBLIC_MEDUSA_BACKEND_URL=http://localhost:9000
NEXT_PUBLIC_CONVEX_URL=https://your-project.convex.cloud
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
JWT_SECRET=<generate-with: openssl rand -base64 32>
NEXTAUTH_SECRET=<generate-with: openssl rand -base64 32>
NEXTAUTH_URL=http://localhost:3000
STRIPE_WEBHOOK_SECRET=whsec_...
```

**Medusa Backend** (`apps/medusa-backend/.env`):
```env
DATABASE_URL=postgresql://medusa:medusa_password@localhost:5432/medusa
REDIS_URL=redis://localhost:6379
MEDUSA_BACKEND_URL=http://localhost:9000
JWT_SECRET=<same-as-frontend>
COOKIE_SECRET=<generate-random-string>
STORE_CORS=http://localhost:3000
ADMIN_CORS=http://localhost:5173,http://localhost:9000
AUTH_CORS=http://localhost:3000
STRIPE_API_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
CONVEX_URL=https://your-project.convex.cloud
CONVEX_ADMIN_KEY=your_convex_admin_key
```

### 3. Start Local Infrastructure

```bash
# Start PostgreSQL, Redis, and Medusa via Docker Compose
docker compose up -d
```

### 4. Run Medusa Migrations

```bash
cd apps/medusa-backend
npm run migrations:run
cd ../..
```

### 5. Deploy Convex Functions

```bash
cd apps/storefront
npx convex dev  # Starts Convex dev server + deploys schema
cd ../..
```

### 6. Start the Frontend

```bash
npm run dev
```

This starts:
- **Storefront:** `http://localhost:3000`
- **Medusa Backend:** `http://localhost:9000`
- **Medusa Admin:** `http://localhost:5173` (if running separately)

---

## Project Structure

```
ecommerce-store/
├── apps/
│   ├── storefront/              # Next.js frontend
│   │   ├── src/
│   │   │   ├── app/             # App Router pages
│   │   │   ├── components/      # UI components
│   │   │   │   ├── ui/          # Primitive design system
│   │   │   │   ├── layout/      # Navbar, Footer
│   │   │   │   ├── product/     # Product components
│   │   │   │   ├── cart/        # Cart components
│   │   │   │   ├── home/        # Home page sections
│   │   │   │   └── account/     # User dashboard
│   │   │   ├── lib/             # Utilities & API clients
│   │   │   │   ├── medusa/      # Medusa API client
│   │   │   │   ├── convex/      # Convex wrappers
│   │   │   │   └── utils/       # Helpers (cn, formatPrice)
│   │   │   ├── hooks/           # Custom React hooks
│   │   │   ├── providers/       # Context providers
│   │   │   └── styles/          # Animation variants
│   │   ├── convex/              # Convex schema & functions
│   │   └── .env.example
│   │
│   └── medusa-backend/          # Medusa.js v2
│       ├── src/
│       │   ├── api/             # Custom API routes
│       │   ├── subscribers/     # Event subscribers
│       │   └── modules/         # Custom modules
│       ├── medusa-config.ts
│       └── .env.example
│
├── packages/
│   ├── types/                   # Shared TypeScript types
│   └── config/                  # Shared tsconfig, eslint
│
├── docker-compose.yml           # Local dev infrastructure
├── turbo.json                   # Turborepo config
└── package.json
```

---

## Key Features

### Storefront
- **Home page:** Animated hero, featured products, category cards, newsletter signup
- **Product listing:** SSR with ISR caching, filters (price), sorting, pagination
- **Product detail:** Image gallery with zoom, variant selection, real-time stock check, add-to-cart
- **Cart:** Zustand-based state, slide-out drawer, quantity controls, persistent via cookie
- **Checkout:** Server Action flow → Medusa cart → Stripe hosted checkout
- **User dashboard:** Profile, order history, order detail

### Real-time (Convex)
- **Inventory sync:** Medusa subscriber pushes stock changes to Convex → live updates in browser
- **Analytics:** Event tracking (views, cart adds, purchases) with dashboard queries
- **Wishlist:** User-saved products with real-time sync
- **Notifications:** Order updates, back-in-stock alerts

### Design System
- **Typography:** Inter (body) + Space Grotesk (display)
- **Colors:** Dark theme with violet primary (#6D28D9) and amber accent (#F59E0B)
- **Components:** Button (4 variants), Card (glass-morphism), Modal, Input, Badge, Pagination, Skeleton
- **Animations:** Framer Motion throughout — hero parallax, staggered reveals, hover lift, page transitions

---

## Deployment

### Frontend → Vercel

1. Connect your repo to Vercel
2. Set root directory to `apps/storefront`
3. Add all environment variables from `.env.example`
4. Deploy

### Medusa Backend → Railway

1. Create a Railway project with PostgreSQL addon
2. Add Redis addon
3. Deploy via Dockerfile or Railway native Node.js
4. Set environment variables
5. Run migrations: `npx medusa migrations run`

### Convex → Convex Cloud

```bash
cd apps/storefront
npx convex deploy
npx convex dev  # For development
```

---

## Design Tokens

| Token | Value | Usage |
|---|---|---|
| `--color-primary` | `#6D28D9` | CTAs, links, active states |
| `--color-accent` | `#F59E0B` | Highlights, sale badges |
| `--color-bg` | `#0F0F0F` | Page background |
| `--color-surface` | `#1A1A2E` | Cards, elevated surfaces |
| `--color-text` | `#F1F1F1` | Primary text |
| `--color-text-muted` | `#A0A0B0` | Secondary text |

---

## Development Scripts

```bash
npm run dev          # Start all apps (turbo)
npm run build        # Build all apps
npm run lint         # Lint all apps
npm run type-check   # TypeScript type checking
```

Per-app:
```bash
cd apps/storefront && npm run dev
cd apps/medusa-backend && npm run dev
```

---

## Future Enhancements

- [ ] Full NextAuth integration with Medusa customer creation flow
- [ ] Stripe Elements embedded checkout (vs hosted)
- [ ] Search with Algolia/Meilisearch integration
- [ ] Multi-region / multi-currency support
- [ ] i18n with Next.js internationalization
- [ ] Headless CMS (Sanity/Contentful) for blog/marketing content
- [ ] Email notifications (Resend/SendGrid) via Medusa notification module
- [ ] Admin analytics dashboard page
- [ ] PWA support (service worker, offline cart)
- [ ] E2E tests with Playwright

---

## 🐛 Troubleshooting

### Common Issues

**Docker containers won't start:**
```bash
# Check if ports are already in use
netstat -ano | findstr :5432
netstat -ano | findstr :6379
netstat -ano | findstr :9000

# Kill processes using those ports or change ports in docker-compose.yml
```

**Database connection errors:**
```bash
# Ensure PostgreSQL is healthy before running migrations
docker compose ps
# Wait until postgres shows "healthy" status
```

**Medusa migrations fail:**
```bash
# Reset database (WARNING: deletes all data)
cd apps/medusa-backend
npx medusa db:migrate reset
npm run migrations:run
```

**Convex won't connect:**
- Ensure `NEXT_PUBLIC_CONVEX_URL` matches your Convex project URL
- Run `npx convex dev` from `apps/storefront` directory
- Check that Convex schema is deployed: `npx convex deploy`

**Stripe webhook errors:**
- Use Stripe CLI for local webhook testing: `stripe listen --forward-to localhost:9000/webhooks/stripe`
- Update `STRIPE_WEBHOOK_SECRET` with the signing secret from Stripe CLI

**CORS errors:**
- Verify `STORE_CORS` in Medusa `.env` matches your frontend URL
- Ensure both services are running on the correct ports

---

## 📞 Support

For issues, questions, or contributions:
- Open an issue on [GitHub](https://github.com/Jourizar/medusa_ecommerce_wdis/issues)
- Check the [Medusa.js Documentation](https://docs.medusajs.com/v2)
- Check the [Next.js Documentation](https://nextjs.org/docs)

---

## 📄 License

MIT
