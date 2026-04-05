import { z } from "zod";

export const PRODUCT_TYPES = [
  "whisky",
  "ron",
  "gin",
  "tequila",
  "vodka",
  "licor",
  "aguardiente",
  "energy_drink",
] as const;

export type ProductType = (typeof PRODUCT_TYPES)[number];

export const ProductSchema = z.object({
  id: z.number(),
  name: z.string(),
  type: z.string(),
  sizeMl: z.number().nullable(),
  sellPriceClient: z.number(),
  buyPriceSupplier: z.number(),
  description: z.string().nullable(),
  batchSize: z.number(),
});

export const CreateProductDtoSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  type: z.enum(PRODUCT_TYPES, { message: "Seleccioná un tipo" }),
  sizeMl: z.number().positive().nullable().optional(),
  sellPriceClient: z.number().positive("El precio de venta debe ser mayor a 0"),
  buyPriceSupplier: z.number().positive("El precio de compra debe ser mayor a 0"),
  description: z.string().optional(),
  batchSize: z.number().int().positive("El tamaño de caja debe ser mayor a 0"),
});

export const UpdateProductDtoSchema = CreateProductDtoSchema.partial();

export type Product = z.infer<typeof ProductSchema>;
export type CreateProductDto = z.infer<typeof CreateProductDtoSchema>;
export type UpdateProductDto = z.infer<typeof UpdateProductDtoSchema>;
