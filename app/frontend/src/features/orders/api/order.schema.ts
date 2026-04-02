import z from "zod";

export const orderCreateSchema = z.object({
  clientId: z.number(),
  items: z.array(
    z.object({
      productId: z.number(),
      quantity: z.number(),
      pricePerUnit: z.number(),
    }),
  ),
});
export const orderSchema = z.object({
  orderId: z.number(),
  createdAt: z.string(),
  clientName: z.string(),
  phone: z.string(),
  lines: z.array(
    z.object({
      lineId: z.number(),
      productId: z.number(),
      pricePerUnit: z.number(),
      quantity: z.number(),
      lineTotal: z.number(),
      productName: z.string(),
    }),
  ),
});

export type Order = z.infer<typeof orderSchema>;
export type OrderCreateDto = z.infer<typeof orderCreateSchema>;
