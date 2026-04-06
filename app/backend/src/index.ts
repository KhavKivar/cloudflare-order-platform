import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { Bindings } from "./db/index.js";

const app = new Hono<{ Bindings: Bindings }>();

app.use("*", logger());
app.use(
  "*",
  cors({
    origin: (origin) => {
      if (!origin) return null;
      const allowedOrigins = [
        "https://vasvani.shop",
        "https://www.vasvani.shop",
        "https://vasvani.vercel.app",
        "https://www.vasvani.vercel.app",
        "https://ordersapp-frontend.pages.dev",
        "http://localhost:5173",
        "http://localhost:8788",
        "http://127.0.0.1:8788",
      ];
      if (
        allowedOrigins.includes(origin) ||
        origin.endsWith("vasvani.pages.dev")
      ) {
        return origin;
      }
      return null;
    },
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
    credentials: true,
  }),
);

// Auth Middleware
app.use("*", async (c, next) => {
  if (c.req.path.includes("login") || c.req.method === "OPTIONS") {
    return await next();
  }

  const authHeader = c.req.header("Authorization");
  const expectHeader = `Bearer ${c.env.API_SECRET_KEY}`;

  if (!authHeader || authHeader !== expectHeader) {
    return c.json(
      {
        status: 401,
        code: "UNAUTHORIZED",
        message: "Unauthorized",
      },
      401,
    );
  }

  await next();
});

app.get("/", (c) => c.text("OrderSapp API - Cloudflare Worker"));

// TODO: Import and register modules
import { clientsRoutes } from "./modules/clients/index.js";
import { productsRoutes } from "./modules/products/index.js";
import { ordersRoutes } from "./modules/orders/index.js";
import { purchaseOrdersRoutes } from "./modules/purchase_orders/index.js";
import { revenueRoutes } from "./modules/revenue/index.js";

app.route("/clients", clientsRoutes);
app.route("/products", productsRoutes);
app.route("/orders", ordersRoutes);
app.route("/purchase_orders", purchaseOrdersRoutes);
app.route("/revenue", revenueRoutes);

export default app;
