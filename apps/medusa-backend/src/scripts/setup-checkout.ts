import {
  createShippingOptionsWorkflow,
  updateRegionsWorkflow,
} from "@medusajs/medusa/core-flows";
import { ExecArgs, MedusaContainer } from "@medusajs/framework/types";
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils";

/**
 * Makes an existing database checkout-ready. Safe to re-run; every step
 * skips work that is already done. Run with: npm run setup:checkout
 *
 * 1. Enables Stripe on every region.
 * 2. Links the manual fulfillment provider + a shipping fulfillment set to
 *    each stock location that serves a sales channel.
 * 3. Creates Standard / Express shipping options (Standard is free over $100).
 * 4. Assigns products without a shipping profile to the default profile —
 *    carts can only ship items whose profile has a shipping option.
 */

const STRIPE_PROVIDER_ID = "pp_stripe_stripe";
const FULFILLMENT_PROVIDER_ID = "manual_manual";
const COUNTRIES = ["us", "ca"];

export default async function setupCheckoutScript({ container }: ExecArgs) {
  await setupCheckout(container);
}

export async function setupCheckout(container: MedusaContainer) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const link = container.resolve(ContainerRegistrationKeys.LINK);
  const fulfillmentModuleService = container.resolve(Modules.FULFILLMENT);

  // 1. Stripe on every region
  const { data: regions } = await query.graph({
    entity: "region",
    fields: ["id", "name", "payment_providers.id"],
  });
  for (const region of regions) {
    const providers = (region.payment_providers ?? []).map((p: any) => p.id);
    if (providers.includes(STRIPE_PROVIDER_ID)) continue;
    await updateRegionsWorkflow(container).run({
      input: {
        selector: { id: region.id },
        update: { payment_providers: [...providers, STRIPE_PROVIDER_ID] },
      },
    });
    logger.info(`Stripe enabled for region "${region.name}".`);
  }

  // Default shipping profile — the one most products already use (a DB can
  // end up with two "default" profiles: Medusa's migration's and the seed's).
  const { data: profiles } = await query.graph({
    entity: "shipping_profile",
    fields: ["id", "type"],
  });
  const { data: products } = await query.graph({
    entity: "product",
    fields: ["id", "shipping_profile.id"],
  });
  const usage = new Map<string, number>();
  for (const p of products) {
    const id = p.shipping_profile?.id;
    if (id) usage.set(id, (usage.get(id) ?? 0) + 1);
  }
  const defaults = profiles
    .filter((p: any) => p.type === "default")
    .sort((a: any, b: any) => (usage.get(b.id) ?? 0) - (usage.get(a.id) ?? 0));
  const profile = defaults[0] ?? profiles[0];
  if (!profile) throw new Error("No shipping profile found — run the seed first.");

  // 2 + 3. Fulfillment wiring and shipping options per serving location
  const { data: locations } = await query.graph({
    entity: "stock_location",
    fields: [
      "id",
      "name",
      "sales_channels.id",
      "fulfillment_providers.id",
      "fulfillment_sets.id",
      "fulfillment_sets.type",
      "fulfillment_sets.service_zones.id",
      "fulfillment_sets.service_zones.shipping_options.id",
    ],
  });

  for (const location of locations.filter((l: any) => l.sales_channels?.length)) {
    if (!location.fulfillment_providers?.some((p: any) => p.id === FULFILLMENT_PROVIDER_ID)) {
      await link.create({
        [Modules.STOCK_LOCATION]: { stock_location_id: location.id },
        [Modules.FULFILLMENT]: { fulfillment_provider_id: FULFILLMENT_PROVIDER_ID },
      });
      logger.info(`Manual fulfillment provider linked to "${location.name}".`);
    }

    let fulfillmentSet = location.fulfillment_sets?.find((s: any) => s.type === "shipping");
    if (!fulfillmentSet) {
      // Reuse an unlinked set left behind by an older seed, else create one.
      const name = `${location.name} Domestic`;
      const [existing] = await fulfillmentModuleService.listFulfillmentSets(
        { name },
        { relations: ["service_zones"] }
      );
      const set =
        existing ??
        (await fulfillmentModuleService.createFulfillmentSets({
          name,
          type: "shipping",
          service_zones: [
            {
              name,
              geo_zones: COUNTRIES.map((country_code) => ({
                country_code,
                type: "country" as const,
              })),
            },
          ],
        }));
      await link.create({
        [Modules.STOCK_LOCATION]: { stock_location_id: location.id },
        [Modules.FULFILLMENT]: { fulfillment_set_id: set.id },
      });
      const { data: [linked] } = await query.graph({
        entity: "fulfillment_set",
        fields: ["id", "service_zones.id", "service_zones.shipping_options.id"],
        filters: { id: set.id },
      });
      fulfillmentSet = linked;
      logger.info(`Fulfillment set linked to "${location.name}".`);
    }

    const zone = fulfillmentSet.service_zones?.[0];
    if (!zone) continue;
    if (zone.shipping_options?.length) continue;

    const base = {
      service_zone_id: zone.id,
      shipping_profile_id: profile.id,
      provider_id: FULFILLMENT_PROVIDER_ID,
      price_type: "flat" as const,
      rules: [
        { attribute: "enabled_in_store", value: "true", operator: "eq" as const },
        { attribute: "is_return", value: "false", operator: "eq" as const },
      ],
    };
    await createShippingOptionsWorkflow(container).run({
      input: [
        {
          ...base,
          name: "Standard Shipping",
          type: { label: "Standard", description: "Ships in 3-5 business days.", code: "standard" },
          prices: [
            { currency_code: "usd", amount: 8 },
            { currency_code: "cad", amount: 11 },
            // Free over $100 / C$137, matching the storefront banner.
            { currency_code: "usd", amount: 0, rules: [{ attribute: "item_total", operator: "gte", value: 100 }] },
            { currency_code: "cad", amount: 0, rules: [{ attribute: "item_total", operator: "gte", value: 137 }] },
          ],
        },
        {
          ...base,
          name: "Express Shipping",
          type: { label: "Express", description: "Ships in 1-2 business days.", code: "express" },
          prices: [
            { currency_code: "usd", amount: 20 },
            { currency_code: "cad", amount: 27 },
          ],
        },
      ],
    });
    logger.info(`Shipping options created for "${location.name}".`);
  }

  // 4. Products without a shipping profile
  const unassigned = products.filter((p: any) => !p.shipping_profile?.id);
  if (unassigned.length) {
    await link.create(
      unassigned.map((p: any) => ({
        [Modules.PRODUCT]: { product_id: p.id },
        [Modules.FULFILLMENT]: { shipping_profile_id: profile.id },
      }))
    );
    logger.info(`${unassigned.length} products assigned to the default shipping profile.`);
  }

  logger.info("Checkout setup complete.");
}
