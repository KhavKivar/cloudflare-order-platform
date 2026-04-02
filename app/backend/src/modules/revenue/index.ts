import { Hono } from "hono";
import { Bindings, getDb } from "../../db/index.js";
import { RevenueService } from "./revenue.service.js";

const revenueApp = new Hono<{ Bindings: Bindings }>();

revenueApp.get("/day", async (c) => {
  const db = getDb(c.env);
  const revenueService = new RevenueService(db);
  const revenue = await revenueService.getRevenueByDay();
  return c.json({ revenue });
});

export { revenueApp as revenueRoutes };
