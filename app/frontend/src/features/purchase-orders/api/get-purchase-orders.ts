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
  lines: PurchaseOrderLine[];
};

export type PurchaseOrdersResponse = {
  orders: PurchaseOrderListItem[];
};

export const getPurchaseOrders = async (): Promise<PurchaseOrdersResponse> => {
  const res = await httpClient.get("/purchase_orders");

  const data: PurchaseOrdersResponse = res.data;

  const ordersList = data.orders.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  return { orders: ordersList };
};
