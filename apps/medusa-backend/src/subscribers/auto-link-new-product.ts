import { SubscriberConfig, SubscriberArgs } from "@medusajs/framework";
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils";

/**
 * Auto-link a newly created product to:
 *   - the "Webshop" sales channel (so the storefront's publishable key sees it)
 *   - the default shipping profile (so cart/checkout accepts it)
 *
 * Runs on product.created. Idempotent — no-op if the links already exist.
 */
export default async function autoLinkNewProduct({
  event,
  container,
}: SubscriberArgs<{ id: string }>) {
  const productId = event.data.id;
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const link = container.resolve(ContainerRegistrationKeys.LINK);

  const { data: existing } = await query.graph({
    entity: "product",
    fields: ["id", "sales_channels.id", "sales_channels.name", "shipping_profile.id"],
    filters: { id: productId },
  });
  const product = existing[0];
  if (!product) {
    logger.warn(`[auto-link] product ${productId} not found`);
    return;
  }

  const { data: channels } = await query.graph({
    entity: "sales_channel",
    fields: ["id", "name"],
    filters: { name: "Webshop" },
  });
  const webshop = channels[0];

  const alreadyOnWebshop = (product.sales_channels ?? []).some(
    (sc: any) => sc?.id === webshop?.id
  );
  if (webshop && !alreadyOnWebshop) {
    await link.create({
      [Modules.PRODUCT]: { product_id: productId },
      [Modules.SALES_CHANNEL]: { sales_channel_id: webshop.id },
    });
    logger.info(`[auto-link] ${productId} → sales_channel Webshop`);
  }

  const hasShippingProfile =
    !!product.shipping_profile && !Array.isArray(product.shipping_profile)
      ? true
      : Array.isArray(product.shipping_profile)
        ? product.shipping_profile.length > 0
        : false;

  if (!hasShippingProfile) {
    const { data: profiles } = await query.graph({
      entity: "shipping_profile",
      fields: ["id", "name"],
    });
    const profile =
      profiles.find((p: any) => p.name === "Default") ?? profiles[0];
    if (profile) {
      await link.create({
        [Modules.PRODUCT]: { product_id: productId },
        [Modules.FULFILLMENT]: { shipping_profile_id: profile.id },
      });
      logger.info(`[auto-link] ${productId} → shipping_profile ${profile.name}`);
    }
  }
}

export const config: SubscriberConfig = {
  event: "product.created",
  context: {
    subscriberId: "auto-link-new-product",
  },
};
