import { SubscriberConfig, SubscriberArgs } from "@medusajs/framework";
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils";
import type { CustomerWelcomeData } from "../modules/smtp-notification/templates";

/**
 * Welcome email when someone registers. Guest checkouts also create
 * customers (has_account = false); those don't get one.
 */
export default async function customerWelcomeEmail({ event, container }: SubscriberArgs<{ id: string }>) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const notifications = container.resolve(Modules.NOTIFICATION);

  const { data: [customer] } = await query.graph({
    entity: "customer",
    fields: ["email", "first_name", "has_account"],
    filters: { id: event.data.id },
  });
  if (!customer?.has_account || !customer.email) return;

  const data: CustomerWelcomeData = {
    first_name: customer.first_name,
    store_url: process.env.STORE_URL ?? "",
  };

  try {
    await notifications.createNotifications({
      to: customer.email,
      channel: "email",
      template: "customer-welcome",
      data,
    });
  } catch (e) {
    logger.error(`[email] welcome email to ${customer.email} failed: ${(e as Error).message}`);
  }
}

export const config: SubscriberConfig = {
  event: "customer.created",
  context: { subscriberId: "customer-welcome-email" },
};
