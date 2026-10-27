import { createShippingOptionsWorkflow } from "@medusajs/medusa/core-flows";
import { ExecArgs } from "@medusajs/framework/types";
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils";

/**
 * One-off script — creates flat-rate shipping options against the existing
 * service zones + the manual fulfillment provider. Run with:
 *
 *   npx medusa exec ./src/scripts/seed-shipping.ts
 *
 * Idempotent: skips zones that already have a shipping option with the same name.
 */
export default async function seedShipping({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);

  const { data: profiles } = await query.graph({
    entity: "shipping_profile",
    fields: ["id", "name"],
  });
  const profile = profiles.find((p: any) => p.name === "Default") ?? profiles[0];
  if (!profile) throw new Error("No shipping profile found");
  logger.info(`Using shipping profile: ${profile.name} (${profile.id})`);

  const { data: zones } = await query.graph({
    entity: "service_zone",
    fields: ["id", "name", "shipping_options.id", "shipping_options.name"],
  });

  const optionInputs: any[] = [];

  for (const zone of zones) {
    const existingNames = new Set(
      (zone.shipping_options ?? []).map((o: any) => o.name)
    );

    for (const spec of [
      { name: "Standard Shipping", amount: 5, code: "standard" },
      { name: "Express Shipping", amount: 15, code: "express" },
    ]) {
      if (existingNames.has(spec.name)) {
        logger.info(`Skipping ${spec.name} on ${zone.name} — already exists`);
        continue;
      }
      optionInputs.push({
        name: spec.name,
        price_type: "flat",
        provider_id: "manual_manual",
        service_zone_id: zone.id,
        shipping_profile_id: profile.id,
        type: {
          label: spec.name,
          description: spec.name,
          code: spec.code,
        },
        prices: [
          { currency_code: "usd", amount: spec.amount },
          { currency_code: "cad", amount: Number((spec.amount * 1.37).toFixed(2)) },
        ],
        rules: [
          {
            attribute: "enabled_in_store",
            value: "true",
            operator: "eq",
          },
          {
            attribute: "is_return",
            value: "false",
            operator: "eq",
          },
        ],
      });
    }
  }

  if (optionInputs.length === 0) {
    logger.info("All shipping options already exist — nothing to do.");
    return;
  }

  logger.info(`Creating ${optionInputs.length} shipping options…`);
  const { result } = await createShippingOptionsWorkflow(container).run({
    input: optionInputs,
  });
  logger.info(`Created ${result.length} shipping options.`);
}
