import { eq, sql } from "drizzle-orm";
import { DrizzleD1Database } from "drizzle-orm/d1";
import { orderLines, orders } from "../../db/schema.js";

export class RevenueService {
  constructor(private readonly db: DrizzleD1Database<any>) {}

  async getRevenueByDay() {
    // SQLite uses strftime for date formatting
    const results = await this.db
      .select({
        day: sql<string>`strftime('%Y-%m-%d', ${orders.createdAt})`,
        revenue: sql<number>`sum(${orderLines.lineTotal})`,
      })
      .from(orders)
      .innerJoin(orderLines, eq(orders.id, orderLines.orderId))
      .where(eq(orders.status, "delivered_paid"))
      .groupBy(sql`strftime('%Y-%m-%d', ${orders.createdAt})`)
      .all();

    return results;
  }
}
