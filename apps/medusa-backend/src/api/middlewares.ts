import { defineMiddlewares } from "@medusajs/framework/http";
import { json } from "express";

/**
 * Custom body-parser limits.
 * The calendar image-upload route accepts base64-encoded images which
 * can exceed the default 100kb JSON limit, so we raise it just for
 * that route (a 10 MB base64 payload maps to ~7.5 MB of image data).
 */
export default defineMiddlewares({
  routes: [
    {
      matcher: "/admin/calendar-events/upload-image",
      method: ["POST"],
      bodyParser: {
        sizeLimit: "10mb",
      },
      middlewares: [json({ limit: "10mb" })],
    },
    {
      matcher: "/admin/carousel-images/upload-image",
      method: ["POST"],
      bodyParser: {
        sizeLimit: "10mb",
      },
      middlewares: [json({ limit: "10mb" })],
    },
  ],
});
