import httpClient from "@/lib/api-provider";

import type { PurchaseOrderListItem } from "./get-purchase-orders";

export const deletePurchaseOrder = async (
  orderId: number | string,
): Promise<PurchaseOrderListItem> => {
  const res = await httpClient.delete(`/purchase_orders/${orderId}`);

  const response = res.data;

  return response.order ?? response;
};
