import { sql } from "drizzle-orm";
import Fastify from "fastify";
import {
  serializerCompiler,
  validatorCompiler,
} from "fastify-type-provider-zod";
import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import { ClientService } from "../clients/clients.service.js";
import { OrderService } from "../orders/orders.service.js";
import { ProductService } from "../products/products.service.js";
import { purchaseOrdersRoutes } from "./index.js";
import { PurchaseOrderService } from "./purchase_orders.service.js";

describe("Purchase Orders Routes", () => {
  let app: Fastify.FastifyInstance;
  let purchaseOrderService: PurchaseOrderService;
  let orderService: OrderService;
  let productService: ProductService;
  let clientService: ClientService;
  let sharedClientId: number;
  let sharedProductId: number;

  beforeAll(async () => {
    app = Fastify();
    app.setValidatorCompiler(validatorCompiler);
    app.setSerializerCompiler(serializerCompiler);
    app.decorate("db", (await import("../../db/index.js")).db);
    purchaseOrderService = new PurchaseOrderService(app.db);
    orderService = new OrderService(app.db);
    productService = new ProductService(app.db);
    clientService = new ClientService(app.db);
    app.register(purchaseOrdersRoutes, { prefix: "/purchase_orders" });
    await app.ready();
  });

  beforeEach(async () => {
    await app.db.execute(
      sql`TRUNCATE TABLE purchase_orders RESTART IDENTITY CASCADE;`,
    );
    await app.db.execute(sql`TRUNCATE TABLE orders RESTART IDENTITY CASCADE;`);
    await app.db.execute(sql`TRUNCATE TABLE clients RESTART IDENTITY CASCADE;`);
    await app.db.execute(
      sql`TRUNCATE TABLE products RESTART IDENTITY CASCADE;`,
    );

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

  describe("GET /purchase_orders", () => {
    it("should return a list of purchase orders", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/purchase_orders",
      });
      expect(response.statusCode).toBe(200);
      expect(response.json().orders).toBeDefined();
    });
  });

  describe("GET /purchase_orders/:id", () => {
    it("should return a purchase order by ID", async () => {
      const created = await purchaseOrderService.createPurchaseOrder({
        orderListIds: [],
      });
      const response = await app.inject({
        method: "GET",
        url: `/purchase_orders/${created.purchaseOrder.id}`,
      });
      expect(response.statusCode).toBe(200);
      expect(response.json().purchaseOrder).toBeDefined();
    });

    it("should return 404 if not found", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/purchase_orders/999",
      });
      expect(response.statusCode).toBe(404);
    });
  });

  describe("POST /purchase_orders", () => {
    it("should create a purchase order", async () => {
      const order = await orderService.createOrder({
        clientId: sharedClientId,
        items: [{ productId: sharedProductId, pricePerUnit: 20, quantity: 5 }],
      });

      const response = await app.inject({
        method: "POST",
        url: "/purchase_orders",
        payload: {
          orderListIds: [order.order.id],
        },
      });

      expect(response.statusCode).toBe(201);
      expect(response.json().purchaseOrder).toBeDefined();
    });
  });

  describe("PATCH /purchase_orders/:id", () => {
    it("should update a purchase order", async () => {
      const created = await purchaseOrderService.createPurchaseOrder({
        orderListIds: [],
      });
      const order = await orderService.createOrder({
        clientId: sharedClientId,
        items: [{ productId: sharedProductId, pricePerUnit: 20, quantity: 5 }],
      });

      const response = await app.inject({
        method: "PATCH",
        url: `/purchase_orders/${created.purchaseOrder.id}`,
        payload: {
          orderListIds: [order.order.id],
        },
      });

      expect(response.statusCode).toBe(200);
      const updatedOrder = await orderService.getOrderById(order.order.id);
      expect(updatedOrder?.purchaseOrderId).toBe(created.purchaseOrder.id);
    });
  });

  describe("DELETE /purchase_orders/:id", () => {
    it("should delete a purchase order", async () => {
      const created = await purchaseOrderService.createPurchaseOrder({
        orderListIds: [],
      });

      const response = await app.inject({
        method: "DELETE",
        url: `/purchase_orders/${created.purchaseOrder.id}`,
      });

      expect(response.statusCode).toBe(200);
      expect(response.json().order.id).toBe(created.purchaseOrder.id);
    });
  });
});
