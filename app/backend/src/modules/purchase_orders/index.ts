import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { Bindings, getDb } from "../../db/index.js";
import { PurchaseOrderService } from "./purchase_orders.service.js";
import { purchaseOrderCreateSchema, purchaseOrderStatusUpdateSchema } from "./purchase_order.schema.js";

const purchaseOrdersApp = new Hono<{ Bindings: Bindings }>();

purchaseOrdersApp.get("/", async (c) => {
  const db = getDb(c.env);
  const purchaseOrderService = new PurchaseOrderService(db);
  const orders = await purchaseOrderService.listPurchaseOrders();
  return c.json({ orders });
});

purchaseOrdersApp.get("/:id", async (c) => {
  const id = parseInt(c.req.param("id"));
  const db = getDb(c.env);
  const poService = new PurchaseOrderService(db);
  const detail = await poService.getPurchaseOrderById(id);
  if (!detail) return c.json({ message: "Purchase order not found" }, 404);
  return c.json({ purchaseOrder: detail });
});

purchaseOrdersApp.post("/", zValidator("json", purchaseOrderCreateSchema), async (c) => {
  const body = c.req.valid("json");
  const db = getDb(c.env);
  const poService = new PurchaseOrderService(db);
  const result = await poService.createPurchaseOrder(body);
  return c.json(result, 201);
});

purchaseOrdersApp.patch("/:id", zValidator("json", purchaseOrderCreateSchema), async (c) => {
  const id = parseInt(c.req.param("id"));
  const body = c.req.valid("json");
  const db = getDb(c.env);
  const poService = new PurchaseOrderService(db);
  const result = await poService.updatePurchaseOrder(id, body);
  return c.json(result);
});

purchaseOrdersApp.patch("/:id/status", zValidator("json", purchaseOrderStatusUpdateSchema), async (c) => {
  const id = parseInt(c.req.param("id"));
  const body = c.req.valid("json");
  const db = getDb(c.env);
  const poService = new PurchaseOrderService(db);
  const result = await poService.updatePurchaseOrderStatus(id, body);
  if (!result) return c.json({ message: "Purchase order not found" }, 404);
  return c.json({ purchaseOrder: result });
});

purchaseOrdersApp.delete("/:id", async (c) => {
  const id = parseInt(c.req.param("id"));
  const db = getDb(c.env);
  const poService = new PurchaseOrderService(db);
  const result = await poService.deletePurchaseOrder(id);
  return c.json({ purchaseOrder: result });
});

export { purchaseOrdersApp as purchaseOrdersRoutes };
