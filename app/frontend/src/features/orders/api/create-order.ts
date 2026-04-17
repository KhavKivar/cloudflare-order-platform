import httpClient from "@/lib/api-provider";
import type { OrderListItem } from "./get-orders";

interface OrderCreateDTO {
  clientId: number;
  items: {
    productId: number;
    quantity: number;
    pricePerUnit: number;
  }[];
}

export interface CreateOrderResponse {
  id: number;
  clientId: number;
  createdAt: string;
  status: OrderListItem["status"];
  purchaseOrderId: number | null;
}

export const createOrder = async (payload: OrderCreateDTO): Promise<CreateOrderResponse> => {
  const requestBody = {
    clientId: payload.clientId,
    items: payload.items.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
      pricePerUnit: item.pricePerUnit,
    })),
  };

  const res = await httpClient.post("/orders", requestBody);

  return res.data;
};
