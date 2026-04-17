import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { Bindings, getDb } from "../../db/index.js";
import { OrderService } from "./orders.service.js";
import { orderCreateSchema, orderStatusUpdateSchema } from "./orders.schema.js";
import { CLIENT_NOT_FOUND, ORDER_ARE_NOT_AVAILABLE, ORDER_NOT_FOUND, PRODUCT_NOT_FOUND, errorMessage } from "../../utils/error_enum.js";
import { PurchaseOrderService } from "../purchase_orders/purchase_orders.service.js";

const ordersApp = new Hono<{ Bindings: Bindings }>();

ordersApp.get("/", async (c) => {
  const db = getDb(c.env);
  const orderService = new OrderService(db);
  const orders = await orderService.getOrders();
  return c.json({ orders });
});

ordersApp.get("/client/:clientId", async (c) => {
  const clientId = parseInt(c.req.param("clientId"));
  const db = getDb(c.env);
  const orderService = new OrderService(db);
  const orders = await orderService.getOrdersByClientId(clientId);
  return c.json({ orders });
});

ordersApp.get("/available/:id", async (c) => {
  const id = parseInt(c.req.param("id"));
  const db = getDb(c.env);
  const poService = new PurchaseOrderService(db);
  const orderService = new OrderService(db);

  const po = await poService.getPurchaseOrderById(id);
  if (!po) return c.json({ message: errorMessage[ORDER_ARE_NOT_AVAILABLE] }, 404);

  const orders = await orderService.getAvailableOrdersForPurchaseOrder(id);
  return c.json({ orders });
});

ordersApp.get("/:id", async (c) => {
  const id = parseInt(c.req.param("id"));
  const db = getDb(c.env);
  const orderService = new OrderService(db);
  const order = await orderService.getOrderById(id);
  if (!order) return c.json({ message: "Order not found" }, 404);
  return c.json({ order });
});

ordersApp.post("/", zValidator("json", orderCreateSchema), async (c) => {
  const body = c.req.valid("json");
  const db = getDb(c.env);
  const orderService = new OrderService(db);
  try {
    const result = await orderService.createOrder(body);
    return c.json(result, 201);
  } catch (error: any) {
    if ([CLIENT_NOT_FOUND, PRODUCT_NOT_FOUND].includes(error.message)) {
      return c.json({ message: error.message }, 404);
    }
    throw error;
  }
});

ordersApp.patch("/:id", zValidator("json", orderCreateSchema), async (c) => {
  const id = parseInt(c.req.param("id"));
  const body = c.req.valid("json");
  const db = getDb(c.env);
  const orderService = new OrderService(db);
  try {
    const result = await orderService.updateOrder(id, body);
    return c.json(result);
  } catch (error: any) {
    if (error.message === ORDER_NOT_FOUND) return c.json({ message: error.message }, 404);
    throw error;
  }
});

ordersApp.patch("/:id/status", zValidator("json", orderStatusUpdateSchema), async (c) => {
  const id = parseInt(c.req.param("id"));
  const { status } = c.req.valid("json");
  const db = getDb(c.env);
  const orderService = new OrderService(db);
  try {
    const order = await orderService.updateStatus(id, status);
    return c.json({ order });
  } catch (error: any) {
    if (error.message === ORDER_NOT_FOUND) return c.json({ message: error.message }, 404);
    throw error;
  }
});

ordersApp.delete("/:id", async (c) => {
  const id = parseInt(c.req.param("id"));
  const db = getDb(c.env);
  const orderService = new OrderService(db);
  try {
    const deleted = await orderService.deleteOrder(id);
    return c.json({ order: deleted });
  } catch (error: any) {
    if (error.message === ORDER_NOT_FOUND) return c.json({ message: error.message }, 404);
    throw error;
  }
});

export { ordersApp as ordersRoutes };
