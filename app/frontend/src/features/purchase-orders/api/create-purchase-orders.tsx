import httpClient from "@/lib/api-provider";
import type { PurchaseOrderListItem } from "./get-purchase-orders";

interface PurchaseOrderCreateDTO {
  orderListIds: number[];
}

export interface CreatePurchaseOrderResponse {
  purchaseOrder: {
    id: number;
    createdAt: string;
    status: PurchaseOrderListItem["status"];
  };
}

export const createPurchaseOrder = async (
  payload: PurchaseOrderCreateDTO,
): Promise<CreatePurchaseOrderResponse> => {
  const res = await httpClient.post("/purchase_orders", {
    orderListIds: payload.orderListIds,
  });

  return res.data;
};
