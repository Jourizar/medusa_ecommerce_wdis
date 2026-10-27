import type { MedusaRequest, MedusaResponse } from "@medusajs/framework";
import sharp from "sharp";

const MAX_INPUT_BYTES = 8 * 1024 * 1024;

/**
 * Accepts a base64 image, returns a compressed WebP data URL.
 * The admin UI stores that string in carousel_image.image_url.
 *
 * Body: { mime: string, data: string /* base64 without prefix *\/ }
 * Reply: { image_data_url: string }
 */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const body = (req.body ?? {}) as { mime?: string; data?: string };
  if (!body.data) {
    return res.status(400).json({ error: "Missing image data" });
  }

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
