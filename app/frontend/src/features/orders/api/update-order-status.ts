import httpClient from "@/lib/api-provider";

import type { OrderListItem } from "./get-orders";

export type OrderStatus =
  | "pending"
  | "paid"
  | "delivered"
  | "delivered_paid"
  | "cancelled";

export const updateOrderStatus = async (
  orderId: number,
  status: OrderStatus,
) => {
  const requestBody = {
    orderId,
    status,
  };

  const res = await httpClient.patch<{ order: OrderListItem }>(
    `/orders/${orderId}/status`,
    requestBody,
  );

  return res.data.order;
};
