import httpClient from "@/lib/api-provider";

export type PurchaseOrderStatus = "pending" | "received" | "paid" | "cancelled";

export const updatePurchaseOrderStatus = async (
  purchaseOrderId: number,
  status: PurchaseOrderStatus,
) => {
  const res = await httpClient.patch(
    `/purchase_orders/${purchaseOrderId}/status`,
    { status },
  );
  return res.data;
};
