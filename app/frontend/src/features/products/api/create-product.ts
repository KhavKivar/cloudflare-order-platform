import httpClient from "@/lib/api-provider";
import type { CreateProductDto, Product } from "./product.schema";

export const createProduct = async (data: CreateProductDto): Promise<Product> => {
  const res = await httpClient.post("/products", data);
  return res.data.product as Product;
};
