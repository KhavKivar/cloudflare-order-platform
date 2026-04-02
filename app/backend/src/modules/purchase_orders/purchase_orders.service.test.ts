import { sql } from "drizzle-orm";
import Fastify from "fastify";
import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import { ClientService } from "../clients/clients.service.js";
import { OrderService } from "../orders/orders.service.js";
import { ProductService } from "../products/products.service.js";
import { PurchaseOrderService } from "./purchase_orders.service.js";

describe("Purchase Orders Service", () => {
  let app: Fastify.FastifyInstance;
  let purchaseOrderService: PurchaseOrderService;
  let orderService: OrderService;
  let productService: ProductService;
  let clientService: ClientService;
  let sharedClientId: number;
  let sharedProductId: number;

  beforeAll(async () => {
    app = Fastify();
    app.decorate("db", (await import("../../db/index.js")).db);
    purchaseOrderService = new PurchaseOrderService(app.db);
    orderService = new OrderService(app.db);
    productService = new ProductService(app.db);
    clientService = new ClientService(app.db);
  });

  beforeEach(async () => {
    // Clean everything
    await app.db.execute(
      sql`TRUNCATE TABLE purchase_orders RESTART IDENTITY CASCADE;`,
    );
    await app.db.execute(sql`TRUNCATE TABLE orders RESTART IDENTITY CASCADE;`);
    await app.db.execute(sql`TRUNCATE TABLE clients RESTART IDENTITY CASCADE;`);
    await app.db.execute(
      sql`TRUNCATE TABLE products RESTART IDENTITY CASCADE;`,
    );

    // Setup dependencies
    const product = await productService.createProduct({
      name: "Product 1",
      buyPriceSupplier: 10,
      type: "product",
      sellPriceClient: 20,
      sizeMl: null,
      description: null,
      batchSize: 0,
    });
    sharedProductId = product.id;

    const client = await clientService.createClient({
      localName: "Client 1",
      address: "Address 1",
      phone: "123456789",
      phoneId: "123456789",
    });
    sharedClientId = client.id;
  });

  describe("createPurchaseOrder", () => {
    it("should create a purchase order and associate orders", async () => {
      const order = await orderService.createOrder({
        clientId: sharedClientId,
        items: [{ productId: sharedProductId, pricePerUnit: 20, quantity: 5 }],
      });

      const result = await purchaseOrderService.createPurchaseOrder({
        orderListIds: [order.order.id],
      });

      expect(result.purchaseOrder).toBeDefined();
      expect(result.purchaseOrder.id).toBeDefined();

      const updatedOrder = await orderService.getOrderById(order.order.id);
      expect(updatedOrder?.purchaseOrderId).toBe(result.purchaseOrder.id);
    });
  });

  describe("listPurchaseOrders", () => {
    it("should list purchase orders with lines", async () => {
      const order = await orderService.createOrder({
        clientId: sharedClientId,
        items: [{ productId: sharedProductId, pricePerUnit: 20, quantity: 5 }],
      });

      const created = await purchaseOrderService.createPurchaseOrder({
        orderListIds: [order.order.id],
      });

      const list = await purchaseOrderService.listPurchaseOrders();
      expect(list.length).toBe(1);
      expect(list[0].purchaseOrderId).toBe(created.purchaseOrder.id);
      expect(list[0].lines.length).toBe(1);
      expect(list[0].lines[0].productName).toBe("Product 1");
    });
  });

  describe("getPurchaseOrderById", () => {
    it("should return detailed purchase order info", async () => {
      const order = await orderService.createOrder({
        clientId: sharedClientId,
        items: [{ productId: sharedProductId, pricePerUnit: 20, quantity: 5 }],
      });

      const created = await purchaseOrderService.createPurchaseOrder({
        orderListIds: [order.order.id],
      });

      const detail = await purchaseOrderService.getPurchaseOrderById(
        created.purchaseOrder.id,
      );
      expect(detail).not.toBeNull();
      expect(detail?.purchaseOrderId).toBe(created.purchaseOrder.id);
      expect(detail?.orders.length).toBe(1);
      expect(detail?.orders[0].orderId).toBe(order.order.id);
    });

    it("should return null if not found", async () => {
      const detail = await purchaseOrderService.getPurchaseOrderById(999);
      expect(detail).toBeNull();
    });
  });

  describe("updatePurchaseOrder", () => {
    it("should update order associations", async () => {
      const order1 = await orderService.createOrder({
        clientId: sharedClientId,
        items: [{ productId: sharedProductId, pricePerUnit: 20, quantity: 5 }],
      });
      const order2 = await orderService.createOrder({
        clientId: sharedClientId,
        items: [{ productId: sharedProductId, pricePerUnit: 20, quantity: 3 }],
      });

      const created = await purchaseOrderService.createPurchaseOrder({
        orderListIds: [order1.order.id],
      });

      await purchaseOrderService.updatePurchaseOrder(created.purchaseOrder.id, {
        orderListIds: [order2.order.id],
      });

      const updatedOrder1 = await orderService.getOrderById(order1.order.id);
      const updatedOrder2 = await orderService.getOrderById(order2.order.id);

      expect(updatedOrder1?.purchaseOrderId).toBeNull();
      expect(updatedOrder2?.purchaseOrderId).toBe(created.purchaseOrder.id);
    });
  });

  describe("deletePurchaseOrder", () => {
    it("should delete a purchase order", async () => {
      const created = await purchaseOrderService.createPurchaseOrder({
        orderListIds: [],
      });

      const deleted = await purchaseOrderService.deletePurchaseOrder(
        created.purchaseOrder.id,
      );
      expect(deleted.id).toBe(created.purchaseOrder.id);

      const found = await purchaseOrderService.getPurchaseOrderById(
        created.purchaseOrder.id,
      );
      expect(found).toBeNull();
    });
  });
});
