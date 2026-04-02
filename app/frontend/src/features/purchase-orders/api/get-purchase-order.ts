import httpClient from "@/lib/api-provider";

export type PurchaseOrderDetailLine = {
  lineId: number;
  productId: number;
  productName: string | null;
  pricePerUnit: number;
  buyPriceSupplier: number;
  quantity: number;
  lineTotal: number | null;
};

export type PurchaseOrderDetailOrder = {
  orderId: number;
  createdAt: string;
  localName: string | null;
  phone: string | null;
  lines: PurchaseOrderDetailLine[];
};

export type PurchaseOrderDetail = {
  purchaseOrderId: number;
  createdAt: string;
  status: "pending" | "received" | "paid" | "cancelled";
  orders: PurchaseOrderDetailOrder[];
};

export type PurchaseOrderDetailResponse = {
  purchaseOrder: PurchaseOrderDetail;
};

export const getPurchaseOrder = async (
  id: number,
): Promise<PurchaseOrderDetail> => {
  const res = await httpClient.get(`/purchase_orders/${id}`);

  const data: PurchaseOrderDetailResponse = res.data;
  return data.purchaseOrder;
};
