import { ExecArgs } from "@medusajs/framework/types";
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils";
import autoLinkNewProduct from "../subscribers/auto-link-new-product";

/**
 * Manually invoke the auto-link subscriber against an existing product id.
 * Usage: npx medusa exec ./src/scripts/test-auto-link.ts <product_id>
 *
 * Idempotent — if links already exist, no changes.
 */
export default async function testAutoLink({ container, args }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const productId = args[0] ?? "prod_01KWRM9VW8D5BKXDDBJJ7T583W";

  logger.info(`Testing auto-link for ${productId}`);

  await autoLinkNewProduct({
    event: { data: { id: productId } } as any,
    container,
  } as any);

  logger.info("Done.");
}
