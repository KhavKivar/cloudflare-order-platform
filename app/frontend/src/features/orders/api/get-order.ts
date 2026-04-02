import httpClient from "@/lib/api-provider";

export type OrderDetailLine = {
  lineId: number;
  productId: number;
  pricePerUnit: number;
  quantity: number;
  lineTotal: number | null;
  productName: string | null;
  buyPriceSupplier: number;
};

export type OrderDetail = {
  orderId: number;
  purchaseOrderId: number | null;
  createdAt: string;
  clientId: number;
  clientName: string | null;
  localName: string | null;
  phone: string | null;
  lines: OrderDetailLine[];
};

export const getOrder = async (orderId: number): Promise<OrderDetail> => {
  const res = await httpClient.get(`/orders/${orderId}`);

  const data: { order: OrderDetail } = res.data;

  return data.order;
};
