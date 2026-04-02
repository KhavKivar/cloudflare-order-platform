import httpClient from "@/lib/api-provider";

export type OrderLine = {
  lineId: number;
  productId: number;
  pricePerUnit: number;
  quantity: number;
  lineTotal: number | null;
  productName: string | null;
  buyPriceSupplier: number;
};

export type OrderListItem = {
  orderId: number;
  purchaseOrderId: number | null;
  createdAt: string;
  localName: string | null;
  phone: string | null;
  lines: OrderLine[];
  status: "pending" | "paid" | "delivered" | "delivered_paid" | "cancelled";
};

export type OrdersResponse = {
  orders: OrderListItem[];
};

export const getOrders = async (): Promise<OrdersResponse> => {
  const res = await httpClient.get("/orders");

  const data: OrdersResponse = res.data;

  const ordersList = data.orders.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  const ordersResponse: OrdersResponse = {
    orders: ordersList,
  };
  return ordersResponse;
};
