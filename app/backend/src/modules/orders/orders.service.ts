import { eq, isNull, or } from "drizzle-orm";
import { DrizzleD1Database } from "drizzle-orm/d1";
import { clients, orderLines, orders, products } from "../../db/schema.js";
import { CLIENT_NOT_FOUND, ORDER_NOT_FOUND, PRODUCT_NOT_FOUND } from "../../utils/error_enum.js";
import { ClientService } from "../clients/clients.service.js";
import { ProductService } from "../products/products.service.js";
import { CreateOrderInput, OrderListItem, UpdateOrderInput } from "./orders.schema.js";

export class OrderService {
  private readonly clientService: ClientService;
  private readonly productService: ProductService;

  constructor(private readonly db: DrizzleD1Database<any>) {
    this.clientService = new ClientService(db);
    this.productService = new ProductService(db);
  }

  async getOrders(): Promise<OrderListItem[]> {
    const rows = await this.db
      .select({
        createdAt: orders.createdAt,
        orderId: orders.id,
        clientId: orders.clientId,
        localName: clients.localName,
        lineId: orderLines.id,
        productId: orderLines.productId,
        pricePerUnit: orderLines.pricePerUnit,
        quantity: orderLines.quantity,
        lineTotal: orderLines.lineTotal,
        phone: clients.phone,
        productName: products.name,
        buyPriceSupplier: products.buyPriceSupplier,
        purchaseOrderId: orders.purchaseOrderId,
        status: orders.status,
      })
      .from(orders)
      .innerJoin(clients, eq(orders.clientId, clients.id))
      .innerJoin(orderLines, eq(orderLines.orderId, orders.id))
      .leftJoin(products, eq(orderLines.productId, products.id))
      .all();

    const ordersMap = new Map<number, OrderListItem>();
    for (const row of rows) {
      let order = ordersMap.get(row.orderId);
      if (!order) {
        order = {
          orderId: row.orderId,
          createdAt: row.createdAt,
          clientId: row.clientId,
          localName: row.localName,
          phone: row.phone,
          lines: [],
          purchaseOrderId: row.purchaseOrderId,
          status: row.status as any,
        };
        ordersMap.set(row.orderId, order);
      }
      order.lines.push({
        lineId: row.lineId,
        productId: row.productId,
        pricePerUnit: row.pricePerUnit,
        quantity: row.quantity,
        lineTotal: row.lineTotal ?? 0,
        productName: row.productName,
        buyPriceSupplier: row.buyPriceSupplier ?? 0,
      });
    }
    return Array.from(ordersMap.values());
  }

  async createOrder(input: CreateOrderInput) {
    // D1 transactions are handled differently, but drizzle-orm/d1 supports them
    return await this.db.transaction(async (tx) => {
      const client = await this.clientService.getClientById(input.clientId);
      if (!client) throw new Error(CLIENT_NOT_FOUND);

      for (const item of input.items) {
        const product = await this.productService.getProductById(item.productId);
        if (!product) throw new Error(PRODUCT_NOT_FOUND);
      }

      const orderResults = await tx
        .insert(orders)
        .values({ clientId: input.clientId })
        .returning();
      const createdOrder = orderResults[0];

      const itemsToInsert = input.items.map((item) => ({
        orderId: createdOrder.id,
        productId: item.productId,
        pricePerUnit: item.pricePerUnit,
        quantity: item.quantity,
        lineTotal: item.pricePerUnit * item.quantity,
      }));

      const createdLines = await tx
        .insert(orderLines)
        .values(itemsToInsert)
        .returning();

      return { order: createdOrder, lines: createdLines };
    });
  }

  async getOrderById(id: number): Promise<OrderListItem | null> {
    const rows = await this.db
      .select({
        createdAt: orders.createdAt,
        orderId: orders.id,
        clientId: orders.clientId,
        localName: clients.localName,
        lineId: orderLines.id,
        productId: orderLines.productId,
        pricePerUnit: orderLines.pricePerUnit,
        quantity: orderLines.quantity,
        lineTotal: orderLines.lineTotal,
        phone: clients.phone,
        productName: products.name,
        buyPriceSupplier: products.buyPriceSupplier,
        purchaseOrderId: orders.purchaseOrderId,
        status: orders.status,
      })
      .from(orders)
      .innerJoin(clients, eq(orders.clientId, clients.id))
      .innerJoin(orderLines, eq(orderLines.orderId, orders.id))
      .leftJoin(products, eq(orderLines.productId, products.id))
      .where(eq(orders.id, id))
      .all();

    if (rows.length === 0) return null;

    const order: OrderListItem = {
      orderId: rows[0].orderId,
      createdAt: rows[0].createdAt,
      clientId: rows[0].clientId,
      localName: rows[0].localName,
      phone: rows[0].phone,
      lines: [],
      purchaseOrderId: rows[0].purchaseOrderId,
      status: rows[0].status as any,
    };

    for (const row of rows) {
      order.lines.push({
        lineId: row.lineId,
        productId: row.productId,
        pricePerUnit: row.pricePerUnit,
        quantity: row.quantity,
        lineTotal: row.lineTotal ?? 0,
        productName: row.productName,
        buyPriceSupplier: row.buyPriceSupplier ?? 0,
      });
    }

    return order;
  }

  async updateOrder(id: number, input: UpdateOrderInput) {
    return await this.db.transaction(async (tx) => {
      const orderResults = await tx
        .update(orders)
        .set({ clientId: input.clientId })
        .where(eq(orders.id, id))
        .returning();
      
      const updatedOrder = orderResults[0];
      if (!updatedOrder) throw new Error(ORDER_NOT_FOUND);

      await tx.delete(orderLines).where(eq(orderLines.orderId, id));

      const itemsToInsert = input.items.map((item) => ({
        orderId: updatedOrder.id,
        productId: item.productId,
        pricePerUnit: item.pricePerUnit,
        quantity: item.quantity,
        lineTotal: item.pricePerUnit * item.quantity,
      }));

      const updatedLines = await tx
        .insert(orderLines)
        .values(itemsToInsert)
        .returning();

      return { order: updatedOrder, lines: updatedLines };
    });
  }

  async deleteOrder(id: number) {
    return await this.db.transaction(async (tx) => {
      await tx.delete(orderLines).where(eq(orderLines.orderId, id));
      const results = await tx
        .delete(orders)
        .where(eq(orders.id, id))
        .returning();

      if (results.length === 0) throw new Error(ORDER_NOT_FOUND);
      return results[0];
    });
  }

  async updateStatus(id: number, status: string) {
    const results = await this.db
      .update(orders)
      .set({ status: status as any })
      .where(eq(orders.id, id))
      .returning();

    if (results.length === 0) throw new Error(ORDER_NOT_FOUND);
    return results[0];
  }
}
