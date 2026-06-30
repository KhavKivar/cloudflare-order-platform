import httpClient from "@/lib/api-provider";

export type PurchaseOrderLine = {
  productId: number;
  buyPriceSupplier: number;
  sellPriceClient: number;
  quantity: number;
  productName: string | null;
};

export type PurchaseOrderListItem = {
  purchaseOrderId: number;
  createdAt: string;
  status: "pending" | "received" | "paid" | "cancelled";
  lines: PurchaseOrderLine[];
};

export type PurchaseOrdersResponse = {
  orders: PurchaseOrderListItem[];
  nextCursor: number | null;
};

export const getPurchaseOrders = async ({
  pageParam,
}: { pageParam?: number } = {}): Promise<PurchaseOrdersResponse> => {
  const qs = pageParam ? `?cursor=${pageParam}` : "";
  const res = await httpClient.get(`/purchase_orders${qs}`);
  return res.data;
};
