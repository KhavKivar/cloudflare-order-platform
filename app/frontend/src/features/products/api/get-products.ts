import httpClient from "@/lib/api-provider";
import type { Product } from "./product.schema";

export type ProductsResponse = { products: Product[] };

export const getProducts = async (): Promise<ProductsResponse> => {
  const res = await httpClient.get("/products");
  const data: ProductsResponse = res.data;
  return {
    products: data.products.sort((a, b) => a.name.localeCompare(b.name)),
  };
};
