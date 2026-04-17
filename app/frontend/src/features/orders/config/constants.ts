import { getClients } from "@/features/client/api/get-clients";
import { getOrder } from "@/features/orders/api/get-order";
import { getOrders } from "@/features/orders/api/get-orders";
import httpClient from "@/lib/api-provider";
import type { Product } from "@/features/orders/api/product.schema";

export type ProductsResponse = { products: Product[] };

export const queryKeys = {
  orders: ["orders"] as const,
  order: (id: number) => ["orders", id] as const,
  products: ["products"] as const,
  clients: ["clients"] as const,
};

export const queryFns = {
  orders: getOrders,
  order: (id: number) => () => getOrder(id),
  products: (): Promise<ProductsResponse> =>
    httpClient.get("/products").then((res) => res.data),
  clients: getClients,
};
