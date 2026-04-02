import { describe, it } from "vitest";

import { sql } from "drizzle-orm";
import Fastify from "fastify";
import {
  serializerCompiler,
  validatorCompiler,
} from "fastify-type-provider-zod";
import { beforeAll, beforeEach, expect } from "vitest";
import { ClientService } from "../clients/clients.service.js";

import {
  errorMessage,
  ORDER_ARE_NOT_AVAILABLE,
} from "../../utils/error_enum.js";
import { ProductService } from "../products/products.service.js";
import { PurchaseOrderService } from "../purchase_orders/purchase_orders.service.js";
import { ordersRoutes } from "./index.js";
import { OrderService } from "./orders.service.js";

describe("Orders Routes", () => {
  let app: Fastify.FastifyInstance;
  let orderService: OrderService;
  let clientService: ClientService;
  let productService: ProductService;
  let purchaseOrderService: PurchaseOrderService;
  let sharedClientId: number;
  let sharedProductId: number;

  beforeAll(async () => {
    app = Fastify();
    app.setValidatorCompiler(validatorCompiler);
    app.setSerializerCompiler(serializerCompiler);
    app.decorate("db", (await import("../../db/index.js")).db); // gets the mocked one
    orderService = new OrderService(app.db);
    productService = new ProductService(app.db);
    clientService = new ClientService(app.db);
    purchaseOrderService = new PurchaseOrderService(app.db);
    app.register(ordersRoutes, { prefix: "/orders" });
    await app.ready();
  });
  beforeEach(async () => {
    // Clean everything
    await app.db.execute(sql`TRUNCATE TABLE orders RESTART IDENTITY CASCADE;`);
    await app.db.execute(sql`TRUNCATE TABLE clients RESTART IDENTITY CASCADE;`);
    await app.db.execute(
      sql`TRUNCATE TABLE products RESTART IDENTITY CASCADE;`,
    );

    // Recreate dependencies fresh for this test
    const product = await productService.createProduct({
      name: "Product 1",
      buyPriceSupplier: 1,
      type: "product",
      sellPriceClient: 1,
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

  describe("Get (Get/orders)", () => {
    it("should return a list of orders", async () => {
      const order = await app.inject({
        method: "GET",
        url: "/orders",
      });

      expect(order.statusCode).toBe(200);
      expect(order.json().orders).toBeDefined();
    });
  });

  describe("Get by ID (Get/orders/:id)", () => {
    it("should return an order by ID", async () => {
      const orderCreate = await orderService.createOrder({
        clientId: sharedClientId,
        items: [
          {
            productId: sharedProductId,
            pricePerUnit: 1,
            quantity: 1,
          },
        ],
      });
      const order = await app.inject({
        method: "GET",
        url: `/orders/${orderCreate.order.id}`,
      });

      expect(order.statusCode).toBe(200);
      expect(order.json().order).toBeDefined();
    });
  });

  describe("Get available (Get/orders/available/:id)", () => {
    it("should return a list of available order", async () => {
      const orderCreate = await orderService.createOrder({
        clientId: sharedClientId,
        items: [
          {
            productId: sharedProductId,
            pricePerUnit: 1,
            quantity: 1,
          },
        ],
      });

      // we create a purchase order to make the order not available

      const purchaseOrder = await purchaseOrderService.createPurchaseOrder({
        orderListIds: [orderCreate.order.id],
      });
      const order = await app.inject({
        method: "GET",
        url: `/orders/available/${purchaseOrder.purchaseOrder.id}`,
      });

      expect(order.statusCode).toBe(200);
      expect(order.json().orders).toBeDefined();
    });
    it("should throw a error when purchase_order_id not exists", async () => {
      const order = await app.inject({
        method: "GET",
        url: `/orders/available/1`,
      });
      expect(order.statusCode).toBe(404);
      expect(order.json().message).toBe(errorMessage[ORDER_ARE_NOT_AVAILABLE]);
    });
  });

  describe("Create (create/orders)", () => {
    it("should create an order", async () => {
      const order = await app.inject({
        method: "POST",
        url: "/orders",
        payload: {
          clientId: sharedClientId,
          items: [
            {
              productId: sharedProductId,
              pricePerUnit: 1,
              quantity: 1,
            },
          ],
        },
      });
      expect(order.statusCode).toBe(201);
      expect(order.json().order).toBeDefined();
    });
  });

  describe("Update (update/orders/:id)", () => {
    it("should update an order", async () => {
      const orderCreate = await orderService.createOrder({
        clientId: sharedClientId,
        items: [
          {
            productId: sharedProductId,
            pricePerUnit: 1,
            quantity: 1,
          },
        ],
      });
      const order = await app.inject({
        method: "PATCH",
        url: `/orders/${orderCreate.order.id}`,
        payload: {
          orderId: orderCreate.order.id,
          order: {
            clientId: sharedClientId,
            items: [
              {
                productId: sharedProductId,
                pricePerUnit: 2,
                quantity: 2,
              },
            ],
          },
        },
      });
      const response = order.json();
      expect(response.lines[0].pricePerUnit).toBe(2);
      expect(response.lines[0].quantity).toBe(2);
    });
  });

  describe("Delete (delete/orders/:id)", () => {
    it("should delete an order", async () => {
      const orderCreate = await orderService.createOrder({
        clientId: sharedClientId,
        items: [
          {
            productId: sharedProductId,
            pricePerUnit: 1,
            quantity: 1,
          },
        ],
      });
      const order = await app.inject({
        method: "DELETE",
        url: `/orders/${orderCreate.order.id}`,
      });
      const response = order.json();

      expect(response.order.id).toBe(orderCreate.order.id);
    });
  });
});
