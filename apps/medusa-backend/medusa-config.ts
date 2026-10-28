import { defineConfig, Modules } from "@medusajs/framework/utils";

/**
 * Medusa v2 configuration.
 * - PostgreSQL for persistence
 * - Redis for events/cache/workflows/locking (when REDIS_URL is set)
 * - Stripe for payments
 * - File service for product images
 */

// Secrets must be real in production; weak fallbacks are only acceptable in dev.
function secret(name: "JWT_SECRET" | "COOKIE_SECRET"): string {
  const value = process.env[name];
  if (value) return value;
  if (process.env.NODE_ENV === "production") {
    throw new Error(`${name} must be set in production`);
  }
  return `dev-only-${name.toLowerCase()}`;
}

// With Redis available (always, in production), use the Redis-backed
// infrastructure modules. Without it, Medusa falls back to in-memory
// versions, which is fine for local dev but loses state on restart.
const redisUrl = process.env.REDIS_URL;
const redisModules = redisUrl
  ? [
      {
        resolve: "@medusajs/medusa/cache-redis",
        options: { redisUrl },
      },
      {
        resolve: "@medusajs/medusa/event-bus-redis",
        options: { redisUrl },
      },
      {
        resolve: "@medusajs/medusa/workflow-engine-redis",
        options: { redis: { redisUrl } },
      },
      {
        resolve: "@medusajs/medusa/locking",
        options: {
          providers: [
            {
              resolve: "@medusajs/medusa/locking-redis",
              id: "locking-redis",
              is_default: true,
              options: { redisUrl },
            },
          ],
        },
      },
    ]
  : [];

export default defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL!,
    databaseLogging: process.env.NODE_ENV !== "production",
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: secret("JWT_SECRET"),
      cookieSecret: secret("COOKIE_SECRET"),
      // Customers stay signed in for 30 days (matches the storefront session).
      jwtExpiresIn: "30d",
    },
    redisUrl,
  },
  modules: [
    ...redisModules,
    {
      resolve: "@medusajs/medusa/product",
      options: {
        database: {
          clientUrl: process.env.DATABASE_URL,
        },
      },
    },
    {
      resolve: "@medusajs/medusa/cart",
      options: {
        database: {
          clientUrl: process.env.DATABASE_URL,
        },
      },
    },
    {
      resolve: "@medusajs/medusa/order",
      options: {
        database: {
          clientUrl: process.env.DATABASE_URL,
        },
      },
    },
    {
      resolve: "@medusajs/medusa/payment",
      options: {
        providers: [
          {
            resolve: "@medusajs/medusa/payment-stripe",
            id: "stripe",
            options: {
              apiKey: process.env.STRIPE_API_KEY,
              webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
              // Lets Stripe offer Apple Pay, Google Pay and Link — one-tap
              // checkout on phones. Enable them in the Stripe dashboard.
              automaticPaymentMethods: true,
            },
          },
        ],
      },
    },
    {
      resolve: "@medusajs/medusa/notification",
      options: {
        // Order confirmation / welcome emails over SMTP. Off until SMTP_HOST
        // is set; sends are then skipped and logged.
        providers: process.env.SMTP_HOST
          ? [
              {
                resolve: "./src/modules/smtp-notification",
                id: "smtp",
                options: {
                  channels: ["email"],
                  host: process.env.SMTP_HOST,
                  port: Number(process.env.SMTP_PORT || 465),
                  user: process.env.SMTP_USER,
                  pass: process.env.SMTP_PASS,
                  from: process.env.SMTP_FROM || process.env.SMTP_USER,
                  ordersBcc: process.env.SMTP_ORDERS_BCC || undefined,
                },
              },
            ]
          : [],
      },
    },
    {
      resolve: "@medusajs/medusa/file",
      options: {
        providers: [
          {
            resolve: "@medusajs/medusa/file-local",
            id: "local",
            options: {
              // Medusa serves the "static" dir at /static out of the box.
              backend_url: `${process.env.MEDUSA_BACKEND_URL || "http://localhost:9000"}/static`,
              upload_dir: "static",
            },
          },
        ],
      },
    },
    {
      resolve: "./src/modules/calendar",
    },
    {
      resolve: "./src/modules/carousel",
    },
    {
      resolve: "./src/modules/season",
    },
  ],
  admin: {
    // Baked in at build time. "/" = same origin as the dashboard (/app),
    // which is right both locally and behind the reverse proxy.
    backendUrl: "/",
  },
  plugins: [],
});
