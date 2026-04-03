import { relations } from "drizzle-orm/relations";
import { purchaseOrders, orders, clients, products, orderLines } from "./schema";

export const ordersRelations = relations(orders, ({one, many}) => ({
	purchaseOrder: one(purchaseOrders, {
		fields: [orders.purchaseOrderId],
		references: [purchaseOrders.id]
	}),
	client: one(clients, {
		fields: [orders.clientId],
		references: [clients.id]
	}),
	orderLines: many(orderLines),
}));

export const purchaseOrdersRelations = relations(purchaseOrders, ({many}) => ({
	orders: many(orders),
}));

export const clientsRelations = relations(clients, ({many}) => ({
	orders: many(orders),
}));

export const orderLinesRelations = relations(orderLines, ({one}) => ({
	product: one(products, {
		fields: [orderLines.productId],
		references: [products.id]
	}),
	order: one(orders, {
		fields: [orderLines.orderId],
		references: [orders.id]
	}),
}));

export const productsRelations = relations(products, ({many}) => ({
	orderLines: many(orderLines),
}));