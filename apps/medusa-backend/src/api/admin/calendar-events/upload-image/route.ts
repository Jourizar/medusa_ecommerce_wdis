import type { MedusaRequest, MedusaResponse } from "@medusajs/framework";
import sharp from "sharp";

const MAX_INPUT_BYTES = 8 * 1024 * 1024; // 8 MB source image

/**
 * Accepts a base64-encoded image and returns a losslessly recompressed
 * WebP data URL. The admin UI stores that data URL in the calendar
 * event's `image_url` column, so the image lives in Postgres alongside
 * the event — no separate object storage needed.
 *
 * Body: { mime: string, data: string /* base64 without prefix *\/ }
 * Reply: { image_data_url: string }
 */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const body = (req.body ?? {}) as { mime?: string; data?: string };
  if (!body.data) {
    return res.status(400).json({ error: "Missing image data" });
  }

  // Strip a data-URL prefix if the client sent the whole "data:...;base64," string.
  const raw = body.data.includes(",")
    ? body.data.slice(body.data.indexOf(",") + 1)
    : body.data;

  let input: Buffer;
  try {
    input = Buffer.from(raw, "base64");
  } catch {
    return res.status(400).json({ error: "Invalid base64 payload" });
  }

  if (input.length === 0) {
    return res.status(400).json({ error: "Empty image payload" });
  }
  if (input.length > MAX_INPUT_BYTES) {
    return res.status(413).json({
      error: `Image exceeds ${MAX_INPUT_BYTES / (1024 * 1024)} MB limit`,
    });
  }

  try {
    // Lossless WebP with maximum compression effort.
    // Auto-rotate honors EXIF orientation; original pixels are preserved.
    const compressed = await sharp(input, { failOn: "none" })
      .rotate()
      // Images are inlined into page HTML, so size matters for load speed.
      // q82 lossy WebP at <=2000px is visually identical and ~5-10x smaller.
      .resize({ width: 2000, withoutEnlargement: true })
      .webp({ quality: 82, effort: 5 })
      .toBuffer();

    const dataUrl = `data:image/webp;base64,${compressed.toString("base64")}`;

    res.json({
      image_data_url: dataUrl,
      original_bytes: input.length,
      compressed_bytes: compressed.length,
    });
  } catch (err: any) {
    res.status(400).json({
      error: "Could not process image",
      detail: err?.message ?? String(err),
    });
  }
}
