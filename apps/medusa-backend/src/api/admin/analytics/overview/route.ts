import { MedusaRequest, MedusaResponse } from "@medusajs/framework";

/**
 * Custom admin analytics API route.
 * GET /admin/analytics/overview
 * Returns high-level order and revenue metrics for the admin dashboard.
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const query = req.scope.resolve("query");

  // Fetch recent orders count
  const { data: orders } = await query.graph({
    entity: "order",
    fields: ["id", "total", "created_at", "status"],
    filters: {},
    pagination: { skip: 0, take: 100 },
  });

  const totalRevenue = orders.reduce(
    (sum, order) => sum + (order.total || 0),
    0
  );

  const totalOrders = orders.length;

  const averageOrderValue =
    totalOrders > 0 ? totalRevenue / totalOrders : 0;

  res.json({
    total_revenue: totalRevenue,
    total_orders: totalOrders,
    average_order_value: averageOrderValue,
    period: "last_100_orders",
  });
}
