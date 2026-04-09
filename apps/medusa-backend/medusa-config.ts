import { defineConfig, Modules } from "@medusajs/framework/utils";

/**
 * Medusa v2 configuration.
 * - PostgreSQL for persistence
 * - Redis for events/cache
 * - Stripe for payments
 * - File service for product images
 */
export default defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL!,
    databaseLogging: process.env.NODE_ENV !== "production",
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET || "supersecret",
      cookieSecret: process.env.COOKIE_SECRET || "cookiesecret",
    },
    redisUrl: process.env.REDIS_URL,
  },
  modules: [
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
            },
          },
        ],
      },
    },
    {
      resolve: "@medusajs/medusa/notification",
      options: {
        providers: [],
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
              backend_url: "/uploads",
              upload_dir: "uploads",
            },
          },
        ],
      },
    },
  ],
  admin: {
    backendUrl: process.env.MEDUSA_BACKEND_URL || "http://localhost:9000",
  },
  plugins: [],
});
