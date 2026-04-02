import { relations } from "drizzle-orm";
import { clients, orderLines, orders, products, purchaseOrders } from "./schema.js";

export const clientsRelations = relations(clients, ({ many }) => ({
  orders: many(orders),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  client: one(clients, {
    fields: [orders.clientId],
    references: [clients.id],
  }),
  purchaseOrder: one(purchaseOrders, {
    fields: [orders.purchaseOrderId],
    references: [purchaseOrders.id],
  }),
  orderLines: many(orderLines),
}));

export const orderLinesRelations = relations(orderLines, ({ one }) => ({
  order: one(orders, {
    fields: [orderLines.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderLines.productId],
    references: [products.id],
  }),
}));

export const productsRelations = relations(products, ({ many }) => ({
  orderLines: many(orderLines),
}));

export const purchaseOrdersRelations = relations(purchaseOrders, ({ many }) => ({
  orders: many(orders),
}));