import httpClient from "@/lib/api-provider";
import type { UpdateProductDto, Product } from "./product.schema";

export const updateProduct = async (
  id: number,
  data: UpdateProductDto,
): Promise<Product> => {
  const res = await httpClient.patch(`/products/${id}`, data);
  return res.data.product as Product;
};
