import { sqliteTable, AnySQLiteColumn, check, integer, text, numeric, foreignKey } from "drizzle-orm/sqlite-core"
  import { sql } from "drizzle-orm"

export const d1Migrations = sqliteTable("d1_migrations", {
	id: integer().primaryKey({ autoIncrement: true }),
	name: text(),
	appliedAt: numeric("applied_at").default(sql`(CURRENT_TIMESTAMP)`).notNull(),
},
(table) => [
	check("purchase_orders_check_1", sql`"status" IN ('pending', 'received', 'paid', 'cancelled'`),
	check("orders_check_2", sql`"status" IN ('pending', 'paid', 'delivered', 'delivered_paid', 'cancelled'`),
]);

export const clients = sqliteTable("clients", {
	id: integer().primaryKey({ autoIncrement: true }),
	localName: text({ length: 255 }),
	address: text({ length: 512 }),
	phone: text({ length: 20 }),
	phoneId: text("phone_id", { length: 64 }),
},
(table) => [
	check("purchase_orders_check_1", sql`"status" IN ('pending', 'received', 'paid', 'cancelled'`),
	check("orders_check_2", sql`"status" IN ('pending', 'paid', 'delivered', 'delivered_paid', 'cancelled'`),
]);

export const products = sqliteTable("products", {
	id: integer().primaryKey({ autoIncrement: true }),
	name: text({ length: 255 }).notNull(),
	type: text({ length: 64 }).notNull(),
	sizeMl: integer("size_ml"),
	sellPriceClient: integer("sell_price_client").notNull(),
	buyPriceSupplier: integer("buy_price_supplier").notNull(),
	description: text({ length: 1024 }),
	batchSize: integer("batch_size").default(1).notNull(),
},
(table) => [
	check("purchase_orders_check_1", sql`"status" IN ('pending', 'received', 'paid', 'cancelled'`),
	check("orders_check_2", sql`"status" IN ('pending', 'paid', 'delivered', 'delivered_paid', 'cancelled'`),
]);

export const purchaseOrders = sqliteTable("purchase_orders", {
	id: integer().primaryKey({ autoIncrement: true }),
	status: text().default("pending").notNull(),
	createdAt: numeric("created_at").default(sql`(CURRENT_TIMESTAMP)`).notNull(),
},
(table) => [
	check("purchase_orders_check_1", sql`"status" IN ('pending', 'received', 'paid', 'cancelled'`),
	check("orders_check_2", sql`"status" IN ('pending', 'paid', 'delivered', 'delivered_paid', 'cancelled'`),
]);

export const orders = sqliteTable("orders", {
	id: integer().primaryKey({ autoIncrement: true }),
	clientId: integer("client_id").notNull().references(() => clients.id),
	purchaseOrderId: integer("purchase_order_id").references(() => purchaseOrders.id, { onDelete: "set null" } ),
	status: text().default("pending").notNull(),
	createdAt: numeric("created_at").default(sql`(CURRENT_TIMESTAMP)`).notNull(),
},
(table) => [
	check("purchase_orders_check_1", sql`"status" IN ('pending', 'received', 'paid', 'cancelled'`),
	check("orders_check_2", sql`"status" IN ('pending', 'paid', 'delivered', 'delivered_paid', 'cancelled'`),
]);

export const orderLines = sqliteTable("order_lines", {
	id: integer().primaryKey({ autoIncrement: true }),
	orderId: integer("order_id").notNull().references(() => orders.id),
	productId: integer("product_id").notNull().references(() => products.id),
	pricePerUnit: integer("price_per_unit").notNull(),
	quantity: integer().notNull(),
	lineTotal: integer("line_total").generatedAlwaysAs(sql`"price_per_unit" * "quantity"`, { mode: "stored" }),
},
(table) => [
	check("purchase_orders_check_1", sql`"status" IN ('pending', 'received', 'paid', 'cancelled'`),
	check("orders_check_2", sql`"status" IN ('pending', 'paid', 'delivered', 'delivered_paid', 'cancelled'`),
]);

