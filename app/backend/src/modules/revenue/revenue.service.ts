import { eq, ne, sql } from "drizzle-orm";
import { DrizzleD1Database } from "drizzle-orm/d1";
import { orderLines, orders, products } from "../../db/schema.js";

export class RevenueService {
  constructor(private readonly db: DrizzleD1Database<any>) {}

  async getRevenueByDay() {
    // SQLite uses strftime for date formatting
    const results = await this.db
      .select({
        day: sql<string>`strftime('%Y-%m-%d', ${orders.createdAt})`,
        revenue: sql<number>`sum((${orderLines.pricePerUnit} - ${products.buyPriceSupplier}) * ${orderLines.quantity})`,
      })
      .from(orders)
      .innerJoin(orderLines, eq(orders.id, orderLines.orderId))
      .innerJoin(products, eq(orderLines.productId, products.id))
      .where(ne(orders.status, "cancelled"))
      .groupBy(sql`strftime('%Y-%m-%d', ${orders.createdAt})`)
      .all();

    return results;
  }
}
