import {
  createProductCategoriesWorkflow,
  createProductsWorkflow,
} from "@medusajs/medusa/core-flows";
import { ExecArgs } from "@medusajs/framework/types";
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils";
import { setupCheckout } from "./setup-checkout";

/**
 * Sample art pieces for local development of the /art gallery.
 * Safe to re-run: skips if the "art" category already has products.
 * Run with: npm run seed:art
 */

const unsplash = (id: string) =>
  `https://images.unsplash.com/photo-${id}?w=1600&q=80`;

const pieces = [
  { title: "Midnight Static", image: "1536924940846-227afb31e2a5", usd: 420, featured: true },
  { title: "Acid Bloom", image: "1541961017774-22349e4a1262", usd: 380 },
  { title: "Wall Witness", image: "1547891654-e66ed7ebb968", usd: 650, featured: true },
  { title: "Violet Current", image: "1549490349-8643362247b5", usd: 290 },
  { title: "Smoke Signal", image: "1574169208507-84376144848b", usd: 340 },
  { title: "Still Riot", image: "1579783902614-a3fb3927b6a5", usd: 720 },
  { title: "Last Charge", image: "1580136579312-94651dfd596d", usd: 560 },
  { title: "Pasture Noise", image: "1578301978693-85fa9c0320b9", usd: 310 },
];

export default async function seedArt({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const salesChannelModuleService = container.resolve(Modules.SALES_CHANNEL);

  const { data: existing } = await query.graph({
    entity: "product_category",
    fields: ["id", "products.id"],
    filters: { handle: "art" },
  });

  let categoryId = existing[0]?.id as string | undefined;
  if (existing[0]?.products?.length) {
    logger.info("Art category already has products — skipping.");
    return;
  }

  if (!categoryId) {
    const { result } = await createProductCategoriesWorkflow(container).run({
      input: {
        product_categories: [{ name: "Art", handle: "art", is_active: true }],
      },
    });
    categoryId = result[0].id;
    logger.info("Art category created.");
  }

  const salesChannels = await salesChannelModuleService.listSalesChannels();

  await createProductsWorkflow(container).run({
    input: {
      products: pieces.map((piece) => ({
        title: piece.title,
        description: "Original piece. Acrylic on canvas, signed by the artist.",
        category_ids: [categoryId!],
        status: "published" as const,
        thumbnail: unsplash(piece.image),
        images: [{ url: unsplash(piece.image) }],
        metadata: { art_featured: Boolean(piece.featured) },
        options: [{ title: "Edition", values: ["Original"] }],
        sales_channels: salesChannels.map((sc) => ({ id: sc.id })),
        variants: [
          {
            title: "Original",
            options: { Edition: "Original" },
            manage_inventory: false,
            prices: [
              { amount: piece.usd, currency_code: "usd" },
              { amount: Math.round(piece.usd * 1.37), currency_code: "cad" },
            ],
          },
        ],
      })),
    },
  });

  logger.info(`${pieces.length} art pieces seeded.`);

  // Gives the new pieces a shipping profile so they can be checked out.
  await setupCheckout(container);
}
