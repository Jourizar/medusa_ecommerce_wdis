"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { formatPrice } from "@/lib/utils/format-price";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { MedusaOrder } from "@ecommerce/types";

export function OrderHistory() {
  const { user, isAuthenticated } = useAuth();
  const [orders, setOrders] = useState<MedusaOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated || !user?.email) {
      setLoading(false);
      return;
    }

    // TODO: Fetch orders from Medusa API
    // const fetchOrders = async () => {
    //   const data = await getOrdersByEmail(user.email);
    //   setOrders(data);
    //   setLoading(false);
    // };
    // fetchOrders();

    setLoading(false);
  }, [isAuthenticated, user]);

  if (!isAuthenticated) {
    return (
      <div className="glass rounded-2xl p-8 text-center">
        <p className="text-text-muted">
          Sign in to view your order history.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="glass rounded-2xl p-8 text-center">
        <p className="text-text-muted">
          You have not placed any orders yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-display font-bold text-text">
        Order History
      </h2>

      {orders.map((order) => (
        <Link
          key={order.id}
          href={`/account/orders/${order.id}`}
          className="block glass rounded-xl p-4 hover:border-primary/50 transition-colors"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-text">
                Order #{order.display_id}
              </p>
              <p className="text-sm text-text-muted">
                {new Date(order.created_at).toLocaleDateString()}
              </p>
            </div>

            <div className="text-right">
              <p className="font-display font-bold text-text">
                {formatPrice(order.total)}
              </p>
              <Badge
                variant={
                  order.status === "completed" ? "success" : "warning"
                }
                size="sm"
              >
                {order.status}
              </Badge>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
