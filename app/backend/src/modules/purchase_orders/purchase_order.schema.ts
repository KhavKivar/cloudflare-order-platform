import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { purchaseOrders } from "../../db/schema.js";

export const purchaseOrderSchema = createSelectSchema(purchaseOrders);

export const purchaseOrderLineItemSchema = z.object({
  productId: z.number().nullable(),
  buyPriceSupplier: z.number(),
  sellPriceClient: z.number(),
  quantity: z.number(),
  lineTotal: z.number(),
  productName: z.string().nullable(),
});

export const purchaseOrderListItemSchema = z.object({
  purchaseOrderId: z.number(),
  createdAt: z.string(),
  status: z.enum(["pending", "received", "paid", "cancelled"]),
  lines: z.array(purchaseOrderLineItemSchema),
});

export const purchaseOrderStatusUpdateSchema = z.object({
  status: z.enum(["pending", "received", "paid", "cancelled"]),
});

export const purchaseOrderDetailLineSchema = z.object({
  lineId: z.number(),
  productId: z.number(),
  productName: z.string().nullable(),
  pricePerUnit: z.number(),
  buyPriceSupplier: z.number(),
  quantity: z.number(),
  lineTotal: z.number().nullable(),
});

export const purchaseOrderDetailOrderSchema = z.object({
  orderId: z.number(),
  createdAt: z.string(),
  localName: z.string().nullable(),
  phone: z.string().nullable(),
  lines: z.array(purchaseOrderDetailLineSchema),
});

export const purchaseOrderDetailSchema = z.object({
  purchaseOrderId: z.number(),
  createdAt: z.string(),
  status: z.enum(["pending", "received", "paid", "cancelled"]),
  orders: z.array(purchaseOrderDetailOrderSchema),
});

export const purchaseOrderCreateSchema = z.object({
  orderListIds: z.array(z.number()),
});

export const purchaseOrderUpdateSchema = z.object({
  orderListIds: z.array(z.number()),
});

export type PurchaseOrder = z.infer<typeof purchaseOrderSchema>;
export type OrderPurchaseLineItem = z.infer<typeof purchaseOrderLineItemSchema>;
export type OrderPurchaseListItem = z.infer<typeof purchaseOrderListItemSchema>;
export type PurchaseOrderDetailLine = z.infer<typeof purchaseOrderDetailLineSchema>;
export type PurchaseOrderDetailOrder = z.infer<typeof purchaseOrderDetailOrderSchema>;
export type PurchaseOrderDetail = z.infer<typeof purchaseOrderDetailSchema>;
export type CreatePurchaseOrderInput = z.infer<typeof purchaseOrderCreateSchema>;
export type PurchaseOrderStatusUpdateInput = z.infer<typeof purchaseOrderStatusUpdateSchema>;
