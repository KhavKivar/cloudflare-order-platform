import { createSelectSchema, createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { orders, orderLines } from "../../db/schema.js";

export const orderSchema = createSelectSchema(orders);
export const orderLineSchema = createSelectSchema(orderLines);

export const orderStatusEnum = z.enum([
  "pending",
  "paid",
  "delivered",
  "delivered_paid",
  "cancelled",
]);

export const orderLineItemSchema = z.object({
  lineId: z.number(),
  productId: z.number(),
  pricePerUnit: z.number(),
  quantity: z.number(),
  lineTotal: z.number(),
  productName: z.string().nullable(),
  buyPriceSupplier: z.number(),
});

export const orderListItemSchema = z.object({
  orderId: z.number(),
  createdAt: z.string(),
  clientId: z.number(),
  localName: z.string().nullable(),
  phone: z.string().nullable(),
  lines: z.array(orderLineItemSchema),
  purchaseOrderId: z.number().nullable(),
  status: orderStatusEnum,
});

export const orderCreateSchema = z.object({
  clientId: z.number().positive("Client ID must be a positive number"),
  items: z.array(
    z.object({
      productId: z.number().positive("Product ID must be a positive number"),
      pricePerUnit: z.number().positive("Price per unit must be a positive number"),
      quantity: z.number().positive("Quantity must be a positive number"),
    }),
  ),
});

export const orderUpdateSchema = z.object({
  clientId: z.number().positive("Client ID must be a positive number"),
  items: z.array(
    z.object({
      productId: z.number().positive("Product ID must be a positive number"),
      pricePerUnit: z.number().positive("Price per unit must be a positive number"),
      quantity: z.number().positive("Quantity must be a positive number"),
    }),
  ),
});

export const orderStatusUpdateSchema = z.object({
  status: orderStatusEnum,
});

export type Order = z.infer<typeof orderSchema>;
export type OrderListItem = z.infer<typeof orderListItemSchema>;
export type OrderLineItem = z.infer<typeof orderLineItemSchema>;
export type CreateOrderInput = z.infer<typeof orderCreateSchema>;
export type UpdateOrderInput = z.infer<typeof orderUpdateSchema>;
