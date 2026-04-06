import { eq, inArray } from "drizzle-orm";
import { DrizzleD1Database } from "drizzle-orm/d1";
import {
  clients,
  orderLines,
  orders,
  products,
  purchaseOrders,
} from "../../db/schema.js";
import {
  CreatePurchaseOrderInput,
  OrderPurchaseListItem,
  PurchaseOrderDetail,
  PurchaseOrderDetailOrder,
  PurchaseOrderStatusUpdateInput,
} from "./purchase_order.schema.js";

export class PurchaseOrderService {
  constructor(private readonly db: DrizzleD1Database<any>) {}

  async listPurchaseOrders(): Promise<OrderPurchaseListItem[]> {
    const rows = await this.db
      .select({
        createdAt: purchaseOrders.createdAt,
        purchaseOrderId: purchaseOrders.id,
        status: purchaseOrders.status,
        productId: orderLines.productId,
        productName: products.name,
        orderId: orders.id,
        sellPriceClient: orderLines.pricePerUnit,
        buyPriceSupplier: products.buyPriceSupplier,
        quantity: orderLines.quantity,
        lineTotal: orderLines.lineTotal,
      })
      .from(purchaseOrders)
      .leftJoin(orders, eq(orders.purchaseOrderId, purchaseOrders.id))
      .leftJoin(orderLines, eq(orders.id, orderLines.orderId))
      .leftJoin(products, eq(orderLines.productId, products.id))
      .all();

    const ordersMap = new Map<number, OrderPurchaseListItem>();

    for (const row of rows) {
      let purchaseOrder = ordersMap.get(row.purchaseOrderId);
      if (!purchaseOrder) {
        purchaseOrder = {
          purchaseOrderId: row.purchaseOrderId,
          createdAt: row.createdAt,
          status: (row.status ?? "pending") as OrderPurchaseListItem["status"],
          lines: [],
        };
        ordersMap.set(row.purchaseOrderId, purchaseOrder);
      }

      if (
        !row.lineTotal ||
        !row.buyPriceSupplier ||
        !row.sellPriceClient ||
        !row.quantity
      ) {
        continue;
      }

      purchaseOrder.lines.push({
        productId: row.productId,
        productName: row.productName,
        lineTotal: row.lineTotal,
        buyPriceSupplier: row.buyPriceSupplier,
        sellPriceClient: row.sellPriceClient,
        quantity: row.quantity,
      });
    }

    return Array.from(ordersMap.values());
  }

  async updatePurchaseOrderStatus(
    purchaseOrderId: number,
    input: PurchaseOrderStatusUpdateInput,
  ) {
    const result = await this.db
      .update(purchaseOrders)
      .set({ status: input.status })
      .where(eq(purchaseOrders.id, purchaseOrderId))
      .returning();

    if (result.length === 0) return null;
    return result[0];
  }

  async updatePurchaseOrder(
    purchaseOrderId: number,
    input: CreatePurchaseOrderInput,
  ) {
    try {
      await this.db
        .update(orders)
        .set({ purchaseOrderId: null })
        .where(eq(orders.purchaseOrderId, purchaseOrderId));

      if (input.orderListIds.length > 0) {
        await this.db
          .update(orders)
          .set({ purchaseOrderId: purchaseOrderId })
          .where(inArray(orders.id, input.orderListIds));
      }

      return {
        message: "Purchase order updated successfully",
        id: purchaseOrderId,
      };
    } catch (error) {
      console.error("Error updating purchase order:", error);
      throw error;
    }

  }

  async createPurchaseOrder(input: CreatePurchaseOrderInput) {
    const results = await this.db
      .insert(purchaseOrders)
      .values({})
      .returning();
    const createdPurchaseOrder = results[0];

    if (input.orderListIds.length > 0) {
      await this.db
        .update(orders)
        .set({ purchaseOrderId: createdPurchaseOrder.id })
        .where(inArray(orders.id, input.orderListIds));
    }

    return { purchaseOrder: createdPurchaseOrder };
  }

  async deletePurchaseOrder(id: number) {
    const results = await this.db
      .delete(purchaseOrders)
      .where(eq(purchaseOrders.id, id))
      .returning();

    return results[0];
  }

  async getPurchaseOrderById(id: number): Promise<PurchaseOrderDetail | null> {
    const rows = await this.db
      .select({
        purchaseOrderId: purchaseOrders.id,
        purchaseOrderCreatedAt: purchaseOrders.createdAt,
        purchaseOrderStatus: purchaseOrders.status,
        orderId: orders.id,
        orderCreatedAt: orders.createdAt,
        localName: clients.localName,
        phone: clients.phone,
        lineId: orderLines.id,
        productId: orderLines.productId,
        pricePerUnit: orderLines.pricePerUnit,
        quantity: orderLines.quantity,
        lineTotal: orderLines.lineTotal,
        productName: products.name,
        buyPriceSupplier: products.buyPriceSupplier,
      })
      .from(purchaseOrders)
      .leftJoin(orders, eq(orders.purchaseOrderId, purchaseOrders.id))
      .leftJoin(clients, eq(orders.clientId, clients.id))
      .leftJoin(orderLines, eq(orderLines.orderId, orders.id))
      .leftJoin(products, eq(orderLines.productId, products.id))
      .where(eq(purchaseOrders.id, id))
      .all();

    if (rows.length === 0) return null;

    const detail: PurchaseOrderDetail = {
      purchaseOrderId: rows[0].purchaseOrderId,
      createdAt: rows[0].purchaseOrderCreatedAt,
      status: rows[0].purchaseOrderStatus as any,
      orders: [],
    };

    const ordersMap = new Map<number, PurchaseOrderDetailOrder>();

    for (const row of rows) {
      if (!row.orderId || !row.orderCreatedAt) continue;

      let order = ordersMap.get(row.orderId);
      if (!order) {
        order = {
          orderId: row.orderId,
          createdAt: row.orderCreatedAt,
          localName: row.localName,
          phone: row.phone,
          lines: [],
        };
        ordersMap.set(row.orderId, order);
      }

      if (row.lineId === null || row.productId === null) continue;

      order.lines.push({
        lineId: row.lineId,
        productId: row.productId,
        productName: row.productName,
        pricePerUnit: row.pricePerUnit ?? 0,
        buyPriceSupplier: row.buyPriceSupplier ?? 0,
        quantity: row.quantity ?? 0,
        lineTotal: row.lineTotal,
      });
    }

    detail.orders = Array.from(ordersMap.values());
    return detail;
  }
}
