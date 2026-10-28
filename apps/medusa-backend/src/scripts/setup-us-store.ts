import {
  createRegionsWorkflow,
  createShippingOptionsWorkflow,
  createStockLocationsWorkflow,
  createTaxRegionsWorkflow,
  linkSalesChannelsToStockLocationWorkflow,
  updateProductVariantsWorkflow,
  updateStoresWorkflow,
} from "@medusajs/medusa/core-flows";
import { ExecArgs } from "@medusajs/framework/types";
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils";
import { setupCheckout } from "./setup-checkout";

/**
 * Configures an existing store for a US-only shop shipping from Indianapolis.
 * Safe to re-run; every step skips work that is already done.
 * Run with: npm run setup:us-store
 *
 * 1. USD as the only store currency; EUR variant prices become USD.
 * 2. "United States" region (USD, Stripe, tax added at checkout).
 * 3. US tax region with Indiana's 7% state sales tax (no other states).
 * 4. "Indianapolis" stock location, serving the default sales channel.
 * 5. Standard / Express shipping (via setupCheckout) + free local pickup
 *    for Indiana addresses.
 */

const LOCATION_NAME = "Indianapolis";
const PICKUP_ZONE_NAME = "Indianapolis Pickup";

export default async function setupUsStore({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const fulfillmentModuleService = container.resolve(Modules.FULFILLMENT);
  const taxModuleService = container.resolve(Modules.TAX);

  const { data: [store] } = await query.graph({
    entity: "store",
    fields: ["id", "default_sales_channel_id", "supported_currencies.currency_code"],
  });

  // 1. Currency
  const currencies = (store.supported_currencies ?? []).map((c: any) => c.currency_code);
  if (currencies.length !== 1 || currencies[0] !== "usd") {
    await updateStoresWorkflow(container).run({
      input: {
        selector: { id: store.id },
        update: { supported_currencies: [{ currency_code: "usd", is_default: true }] },
      },
    });
    logger.info("Store currency set to USD.");
  }

  // Same amount, new currency — reprices anything that has no USD price yet.
  const { data: variants } = await query.graph({
    entity: "product_variant",
    fields: ["id", "title", "prices.amount", "prices.currency_code"],
  });
  for (const variant of variants) {
    const prices = variant.prices ?? [];
    if (!prices.length || prices.some((p: any) => p.currency_code === "usd")) continue;
    await updateProductVariantsWorkflow(container).run({
      input: {
        selector: { id: variant.id },
        update: { prices: [{ currency_code: "usd", amount: prices[0].amount }] },
      },
    });
    logger.info(`Variant "${variant.title}" priced at $${prices[0].amount}.`);
  }

  // 2. Region
  const { data: regions } = await query.graph({
    entity: "region",
    fields: ["id", "countries.iso_2"],
  });
  let region = regions.find((r: any) => r.countries?.some((c: any) => c.iso_2 === "us"));
  if (!region) {
    const { result } = await createRegionsWorkflow(container).run({
      input: {
        regions: [
          {
            name: "United States",
            currency_code: "usd",
            countries: ["us"],
            is_tax_inclusive: false,
            automatic_taxes: true,
            payment_providers: ["pp_stripe_stripe"],
          },
        ],
      },
    });
    region = result[0];
    logger.info("United States region created.");
  }

  // 3. Taxes — sales tax only where the shop has nexus (Indiana: 7% state
  // rate, no local sales tax). Other states get no default rate, so 0%.
  // Matches the ISO "us-in" province code the storefront checkout sends.
  const usTaxRegions = await taxModuleService.listTaxRegions({ country_code: "us" });
  let usTax = usTaxRegions.find((r) => !r.province_code);
  if (!usTax) {
    const { result } = await createTaxRegionsWorkflow(container).run({
      input: [{ country_code: "us", provider_id: "tp_system" }],
    });
    usTax = result[0];
    logger.info("US tax region created.");
  }
  if (!usTaxRegions.some((r) => r.province_code === "us-in")) {
    await createTaxRegionsWorkflow(container).run({
      input: [
        {
          country_code: "us",
          province_code: "us-in",
          parent_id: usTax.id,
          default_tax_rate: { name: "Indiana Sales Tax", code: "IN-SALES", rate: 7 },
        },
      ],
    });
    logger.info("Indiana 7% sales tax added.");
  }

  // 4. Stock location
  const { data: locations } = await query.graph({
    entity: "stock_location",
    fields: ["id", "name", "sales_channels.id"],
    filters: { name: LOCATION_NAME },
  });
  let location = locations[0];
  if (!location) {
    const { result } = await createStockLocationsWorkflow(container).run({
      input: {
        locations: [
          {
            name: LOCATION_NAME,
            // Placeholder street — edit in admin → Settings → Locations.
            address: {
              address_1: "123 Placeholder St",
              city: "Indianapolis",
              province: "us-in",
              postal_code: "46204",
              country_code: "us",
            },
          },
        ],
      },
    });
    location = { ...result[0], sales_channels: [] };
    logger.info(`"${LOCATION_NAME}" stock location created.`);
  }
  if (!location.sales_channels?.some((sc: any) => sc.id === store.default_sales_channel_id)) {
    await linkSalesChannelsToStockLocationWorkflow(container).run({
      input: { id: location.id, add: [store.default_sales_channel_id] },
    });
    logger.info(`Default sales channel now served from "${LOCATION_NAME}".`);
  }

  await updateStoresWorkflow(container).run({
    input: {
      selector: { id: store.id },
      update: { default_region_id: region.id, default_location_id: location.id },
    },
  });

  // 5. Shipping: Standard / Express to the whole US...
  await setupCheckout(container, { countries: ["us"], currencies: ["usd"] });

  // ...plus free pickup, offered only to Indiana shipping addresses.
  const { data: [linked] } = await query.graph({
    entity: "stock_location",
    fields: [
      "fulfillment_sets.id",
      "fulfillment_sets.type",
      "fulfillment_sets.service_zones.name",
    ],
    filters: { id: location.id },
  });
  const shippingSet = linked.fulfillment_sets?.find((s: any) => s.type === "shipping");
  if (!shippingSet) throw new Error(`No shipping fulfillment set on "${LOCATION_NAME}".`);
  if (!shippingSet.service_zones?.some((z: any) => z.name === PICKUP_ZONE_NAME)) {
    const [zone] = await fulfillmentModuleService.createServiceZones([
      {
        fulfillment_set_id: shippingSet.id,
        name: PICKUP_ZONE_NAME,
        geo_zones: [{ type: "province", country_code: "us", province_code: "us-in" }],
      },
    ]);
    const [profile] = await fulfillmentModuleService.listShippingProfiles({ type: "default" });
    await createShippingOptionsWorkflow(container).run({
      input: [
        {
          name: "Local Pickup – Indianapolis",
          service_zone_id: zone.id,
          shipping_profile_id: profile.id,
          provider_id: "manual_manual",
          price_type: "flat",
          type: {
            label: "Local Pickup",
            description: "Free. We'll email you to arrange a pickup time in Indianapolis.",
            code: "pickup",
          },
          prices: [{ currency_code: "usd", amount: 0 }],
          rules: [
            { attribute: "enabled_in_store", value: "true", operator: "eq" },
            { attribute: "is_return", value: "false", operator: "eq" },
          ],
        },
      ],
    });
    logger.info("Local pickup option created for Indiana addresses.");
  }

  logger.info("US store setup complete.");
}
