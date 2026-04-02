import { createSelectSchema, createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { products } from "../../db/schema.js";

export const productSchema = createSelectSchema(products);
export const createProductSchema = createInsertSchema(products).omit({ id: true });
export const updateProductSchema = createInsertSchema(products).omit({ id: true }).partial();

export type Product = z.infer<typeof productSchema>;
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
