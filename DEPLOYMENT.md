# 🚀 Deployment Guide — Railway + Netlify

## Prerequisites

- [GitHub account](https://github.com) — repo is already pushed
- [Railway account](https://railway.app) — $5/mo minimum
- [Netlify account](https://netlify.com) — free
- [Stripe account](https://stripe.com) — for payments
- [Convex account](https://convex.dev) — optional, for real-time features

---

## Step 1: Deploy Medusa Backend to Railway

### 1.1 Create Railway Project
1. Go to [railway.app](https://railway.app) → **New Project**
2. Click **"Deploy from GitHub repo"**
3. Select `Jourizar/medusa_ecommerce_wdis`
4. Railway will auto-detect the monorepo

### 1.2 Add PostgreSQL Database
1. Click **"New"** → **"Database"** → **"Add PostgreSQL"**
2. Railway auto-generates `DATABASE_URL`

### 1.3 Add Redis
1. Click **"New"** → **"Database"** → **"Add Redis"**
2. Railway auto-generates `REDIS_URL`

### 1.4 Configure the Medusa Service
Railway auto-deploys from `railway.json`. You need to set environment variables:

1. Go to your Medusa service → **Variables** tab
2. Add these variables:

| Variable | Value |
|----------|-------|
| `MEDUSA_BACKEND_URL` | Your Railway service URL (e.g., `https://medusa.up.railway.app`) |
| `JWT_SECRET` | Run: `openssl rand -base64 32` |
| `COOKIE_SECRET` | Run: `openssl rand -base64 32` |
| `STORE_CORS` | Your Netlify URL (set in Step 2) |
| `ADMIN_CORS` | Your Netlify URL |
| `AUTH_CORS` | Your Netlify URL |
| `STRIPE_API_KEY` | From Stripe Dashboard → API Keys |
| `STRIPE_WEBHOOK_SECRET` | From Stripe → Webhooks (set after deploy) |
| `CONVEX_URL` | From Convex dashboard (optional) |
| `CONVEX_ADMIN_KEY` | From Convex dashboard (optional) |

### 1.5 Run Database Migrations
After first deploy, open Railway's **Shell** for the Medusa service and run:
```bash
cd apps/medusa-backend
npx medusa db:migrate
```

### 1.6 Create Admin User
In the Railway Shell:
```bash
cd apps/medusa-backend
npx medusa user --email "admin@store.com" --password "your_secure_password"
```

### 1.7 Create Publishable API Key
1. Open Medusa Admin at `https://your-medusa.up.railway.app/app`
2. Login with the credentials above
3. Go to **Settings → API Keys** → Create a **Publishable Key**
4. Link it to your sales channel(s)
5. Copy the key — you'll need it for Netlify

---

## Step 2: Deploy Storefront to Netlify

### 2.1 Connect Repository
1. Go to [netlify.com](https://netlify.com) → **Add new site** → **Import from Git**
2. Select your GitHub repo `Jourizar/medusa_ecommerce_wdis`
3. Netlify auto-detects `netlify.toml`

### 2.2 Configure Build Settings
Netlify reads from `netlify.toml`, but verify:
- **Base directory:** `apps/storefront`
- **Build command:** `npm install --legacy-peer-deps && npm run build`
- **Publish directory:** `.next`

### 2.3 Install Netlify Next.js Plugin
Netlify will prompt you to install `@netlify/plugin-nextjs` — **accept it**. This plugin handles Next.js SSR, ISR, and image optimization on Netlify's edge network.

### 2.4 Set Environment Variables
Go to **Site settings → Environment variables** and add:

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_MEDUSA_BACKEND_URL` | Your Railway Medusa URL |
| `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` | The key from Step 1.7 |
| `MEDUSA_PUBLISHABLE_KEY` | Same as above |
| `NEXT_PUBLIC_CONVEX_URL` | Your Convex URL (optional) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_test_...` from Stripe |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` from Stripe |
| `JWT_SECRET` | `openssl rand -base64 32` |
| `NEXTAUTH_SECRET` | `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Your Netlify URL (e.g., `https://your-app.netlify.app`) |

### 2.5 Deploy
Click **Deploy site**. Netlify builds and deploys automatically.

Your storefront is now live at `https://your-app.netlify.app`!

---

## Step 3: Configure Stripe Webhooks

### 3.1 Storefront Webhook
1. Go to Stripe Dashboard → **Developers → Webhooks**
2. **Add endpoint** → `https://your-app.netlify.app/api/webhooks/stripe`
3. Select events: `payment_intent.succeeded`, `charge.refunded`
4. Copy the **Signing Secret** → Set as `STRIPE_WEBHOOK_SECRET` in Netlify

### 3.2 Medusa Webhook (Railway)
1. Add another endpoint → `https://your-medusa.up.railway.app/webhooks/stripe`
2. Same events
3. Copy the Signing Secret → Set as `STRIPE_WEBHOOK_SECRET` in Railway

---

## Step 4: Update CORS (if needed)

After Netlify deploys, update Railway's Medusa service variables:
- `STORE_CORS` → `https://your-app.netlify.app`
- `ADMIN_CORS` → `https://your-app.netlify.app`
- `AUTH_CORS` → `https://your-app.netlify.app`

Railway auto-redeploys on variable change.

---

## Step 5: Seed Products (Production)

Run in Railway Shell:
```bash
cd apps/medusa-backend
npx medusa exec ./src/scripts/seed.ts
```

Then link products to sales channel:
```bash
# Get your sales channel ID and publishable key from Medusa Admin
# Then use the fix-sales-channels.sh script locally:
bash fix-sales-channels.sh
```

---

## Cost Breakdown

| Service | Plan | Monthly Cost |
|---------|------|-------------|
| **Railway** | Hobby (Medusa + PostgreSQL + Redis) | ~$5–10 |
| **Netlify** | Pro (Next.js SSR) | Free (hobby) |
| **Convex** | Free tier | Free |
| **Stripe** | Pay per transaction | 2.9% + 30¢ |
| **Total** | | **~$5–10/mo** |

---

## Troubleshooting

**Medusa won't start on Railway:**
- Check Railway logs for migration errors
- Ensure `DATABASE_URL` and `REDIS_URL` are auto-linked
- Run `npx medusa db:migrate` manually in Railway Shell

**Storefront shows no products:**
- Verify `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` is set in Netlify
- Ensure the publishable key is linked to a sales channel
- Check Medusa Admin → Products → verify they're assigned to a sales channel

**CORS errors:**
- Ensure `STORE_CORS` in Railway matches your Netlify URL exactly
- Include `https://` prefix

**Stripe webhook failures:**
- Verify webhook secret matches between Stripe and your env vars
- Check Stripe Dashboard → Webhooks → event logs for errors

---

## Architecture After Deploy

```
┌─────────────────────┐         HTTPS/REST        ┌─────────────────────┐
│  Netlify            │ ◄──────────────────────► │  Railway            │
│  (Storefront)       │                          │  (Medusa Backend)   │
│  - Next.js 15       │                          │  - Node.js server   │
│  - Global CDN       │                          │  - PostgreSQL       │
│  - SSR/ISR          │                          │  - Redis            │
└─────────────────────┘                          └─────────────────────┘
         │                                                │
         │                                       ┌────────▼─────────┐
         │                                       │  Convex Cloud    │
         │                                       │  (Real-time)     │
         └──────────────────────────────────────►│  - Inventory     │
                                                 │  - Wishlist      │
                                                 │  - Analytics     │
                                                 └──────────────────┘
```
