import { sql } from "drizzle-orm";
import Fastify from "fastify";
import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import { ClientService } from "../clients/clients.service.js";

import {
  CLIENT_NOT_FOUND,
  ORDER_NOT_FOUND,
  PRODUCT_NOT_FOUND,
} from "../../utils/error_enum.js";
import { ProductService } from "../products/products.service.js";
import { OrderListItem } from "./orders.schema.js";
import { OrderService } from "./orders.service.js";

describe("Orders Service", () => {
  let app: Fastify.FastifyInstance;
  let orderService: OrderService;
  let clientService: ClientService;
  let productService: ProductService;
  let sharedClientId: number;
  let sharedProductId: number;

  beforeAll(async () => {
    app = Fastify();
    app.decorate("db", (await import("../../db/index.js")).db); // gets the mocked one
    orderService = new OrderService(app.db);
    productService = new ProductService(app.db);
    clientService = new ClientService(app.db);
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

  describe("create orders", () => {
    it("should create a orders", async () => {
      const order = await orderService.createOrder({
        clientId: sharedClientId,
        items: [{ productId: sharedProductId, pricePerUnit: 1, quantity: 1 }],
      });

      expect(order).not.toBeNull();
    });
    it("should throw a error when the client not exists", async () => {
      await expect(() =>
        orderService.createOrder({
          clientId: 9999,
          items: [{ productId: sharedProductId, pricePerUnit: 1, quantity: 1 }],
        }),
      ).rejects.toThrow(CLIENT_NOT_FOUND);
    });
    it("should throw a error when the product not exists", async () => {
      await expect(() =>
        orderService.createOrder({
          clientId: sharedClientId,
          items: [{ productId: 9999, pricePerUnit: 1, quantity: 1 }],
        }),
      ).rejects.toThrow(PRODUCT_NOT_FOUND);
    });
  });

  describe("get orders", () => {
    it("should get a orders", async () => {
      const order = await orderService.createOrder({
        clientId: sharedClientId,
        items: [{ productId: sharedProductId, pricePerUnit: 500, quantity: 2 }],
      });

      const orders: OrderListItem[] = await orderService.getOrders();
      expect(orders).not.toBeNull();
      expect(orders[0].clientId).toBe(order.order.clientId);
      expect(orders[0].lines.length).toBe(1);
    });
  });

  describe("update orders", () => {
    it("should update a orders", async () => {
      const order = await orderService.createOrder({
        clientId: sharedClientId,
        items: [{ productId: sharedProductId, pricePerUnit: 500, quantity: 2 }],
      });

      const updatedOrder = await orderService.updateOrder(order.order.id, {
        clientId: sharedClientId,
        items: [
          { productId: sharedProductId, pricePerUnit: 1000, quantity: 2 },
          { productId: sharedProductId, pricePerUnit: 1000, quantity: 5 },
          { productId: sharedProductId, pricePerUnit: 1000, quantity: 4 },
        ],
      });
      expect(updatedOrder?.order.id).toBe(order.order.id);
      expect(updatedOrder?.order.clientId).toBe(order.order.clientId);
      expect(updatedOrder?.lines.length).toBe(3);
      expect(updatedOrder?.lines[0].pricePerUnit).toBe(1000);
      expect(updatedOrder?.lines[1].pricePerUnit).toBe(1000);
      expect(updatedOrder?.lines[2].pricePerUnit).toBe(1000);
      expect(updatedOrder?.lines[0].quantity).toBe(2);
      expect(updatedOrder?.lines[1].quantity).toBe(5);
      expect(updatedOrder?.lines[2].quantity).toBe(4);
    });

    it("it should throw a error when the order id not exist on db", async () => {
      await expect(() =>
        orderService.updateOrder(9999, {
          clientId: sharedClientId,
          items: [
            { productId: sharedProductId, pricePerUnit: 1000, quantity: 2 },
            { productId: sharedProductId, pricePerUnit: 1000, quantity: 5 },
            { productId: sharedProductId, pricePerUnit: 1000, quantity: 4 },
          ],
        }),
      ).rejects.toThrow(ORDER_NOT_FOUND);
    });
  });

  describe("delete orders", () => {
    it("should delete a orders", async () => {
      const order = await orderService.createOrder({
        clientId: sharedClientId,
        items: [{ productId: sharedProductId, pricePerUnit: 500, quantity: 2 }],
      });

      const deletedOrder = await orderService.deleteOrder(order.order.id);
      // verify that the order is deleted

      const orderDeleted = await orderService.getOrderById(order.order.id);
      expect(orderDeleted).toBeNull();

      expect(deletedOrder?.id).toBe(order.order.id);
      expect(deletedOrder?.clientId).toBe(order.order.clientId);
    });

    it("it should throw a error when the order id not exist on db", async () => {
      await expect(() => orderService.deleteOrder(9999)).rejects.toThrow(
        ORDER_NOT_FOUND,
      );
    });
  });
});
