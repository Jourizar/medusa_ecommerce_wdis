import { SubscriberConfig, SubscriberArgs } from "@medusajs/framework";
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils";
import type { OrderPlacedData } from "../modules/smtp-notification/templates";

/**
 * Emails the customer an order confirmation on order.placed (the store
 * owner gets a BCC when SMTP_ORDERS_BCC is set). A failed send is logged and
 * never affects the order.
 */
export default async function orderPlacedEmail({ event, container }: SubscriberArgs<{ id: string }>) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const notifications = container.resolve(Modules.NOTIFICATION);

  const { data: [order] } = await query.graph({
    entity: "order",
    fields: [
      "id",
      "display_id",
      "email",
      "currency_code",
      "subtotal",
      "item_subtotal",
      "shipping_total",
      "tax_total",
      "discount_total",
      "total",
      "items.product_title",
      "items.variant_title",
      "items.quantity",
      "items.total",
      "shipping_methods.name",
      "shipping_address.*",
    ],
    filters: { id: event.data.id },
  });
  if (!order?.email) {
    logger.warn(`[email] order ${event.data.id} has no email — confirmation skipped`);
    return;
  }

  const a = order.shipping_address;
  const data: OrderPlacedData = {
    display_id: order.display_id,
    first_name: a?.first_name,
    currency_code: order.currency_code,
    items: (order.items ?? []).map((i: any) => ({
      title: i.product_title,
      // Single-variant products are titled "Default variant" — not worth showing.
      variant: i.variant_title && i.variant_title !== "Default variant" ? i.variant_title : null,
      quantity: i.quantity,
      total: Number(i.total),
    })),
    subtotal: Number(order.item_subtotal ?? order.subtotal),
    shipping_total: Number(order.shipping_total),
    tax_total: Number(order.tax_total),
    discount_total: Number(order.discount_total),
    total: Number(order.total),
    shipping_method: order.shipping_methods?.[0]?.name,
    shipping_address: a
      ? [
          [a.first_name, a.last_name].filter(Boolean).join(" "),
          a.address_1,
          a.address_2,
          // Province is stored as ISO "us-in"; show "IN".
          [a.city, a.province?.replace(/^[a-z]{2}-/i, "").toUpperCase(), a.postal_code].filter(Boolean).join(" "),
        ].filter(Boolean) as string[]
      : [],
    store_url: process.env.STORE_URL ?? "",
  };

  try {
    await notifications.createNotifications({
      to: order.email,
      channel: "email",
      template: "order-placed",
      data,
    });
  } catch (e) {
    logger.error(`[email] order #${order.display_id} confirmation failed: ${(e as Error).message}`);
  }
}

export const config: SubscriberConfig = {
  event: "order.placed",
  context: { subscriberId: "order-placed-email" },
};
