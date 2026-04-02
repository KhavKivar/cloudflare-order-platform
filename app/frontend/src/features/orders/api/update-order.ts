import httpClient from "@/lib/api-provider";

import type { OrderCreateDto } from "./order.schema";

export const updateOrder = async (orderId: number, payload: OrderCreateDto) => {
  const requestBody = {
    orderId: orderId,
    order: {
      clientId: payload.clientId,
      items: payload.items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        pricePerUnit: item.pricePerUnit,
      })),
    },
  };

  const res = await httpClient.patch(`/orders/${orderId}`, requestBody);

  return res.data;
};
