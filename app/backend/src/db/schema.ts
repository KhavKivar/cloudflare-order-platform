import { sqliteTable, text, integer, unique, foreignKey } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const clients = sqliteTable("clients", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    localName: text("local_name"),
    address: text("address"),
    phone: text("phone"),
    phoneId: text("phone_id"),
}, (table) => ({
    phoneUnique: unique("clients_phone_unique").on(table.phone),
    phoneIdUnique: unique("clients_phone_id_unique").on(table.phoneId),
}));

export const purchaseOrders = sqliteTable("purchase_orders", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    status: text("status").default("pending").notNull(), // 'pending', 'received', 'paid', 'cancelled'
    createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const orders = sqliteTable("orders", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    clientId: integer("client_id").notNull().references(() => clients.id),
    purchaseOrderId: integer("purchase_order_id").references(() => purchaseOrders.id, { onDelete: "set null" }),
    status: text("status").default("pending").notNull(), // 'pending', 'paid', 'delivered', 'delivered_paid', 'cancelled'
    createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const products = sqliteTable("products", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
    type: text("type").notNull(),
    sizeMl: integer("size_ml"),
    sellPriceClient: integer("sell_price_client").notNull(),
    buyPriceSupplier: integer("buy_price_supplier").notNull(),
    description: text("description"),
    batchSize: integer("batch_size").default(1).notNull(),
});

export const orderLines = sqliteTable("order_lines", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    orderId: integer("order_id").notNull().references(() => orders.id),
    productId: integer("product_id").notNull().references(() => products.id),
    pricePerUnit: integer("price_per_unit").notNull(),
    quantity: integer("quantity").notNull(),
    lineTotal: integer("line_total").notNull(), // SQLite doesn't support generated columns as easily in Drizzle yet, will calculate in code or via raw SQL
});
