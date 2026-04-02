import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { Bindings, getDb } from "../../db/index.js";
import { ProductService } from "./products.service.js";
import { createProductSchema } from "./products.schema.js";

const productsApp = new Hono<{ Bindings: Bindings }>();

productsApp.get("/", async (c) => {
  const db = getDb(c.env);
  const productService = new ProductService(db);
  const products = await productService.getProducts();
  return c.json({ products });
});

productsApp.get("/:id", async (c) => {
  const id = parseInt(c.req.param("id"));
  const db = getDb(c.env);
  const productService = new ProductService(db);
  const product = await productService.getProductById(id);
  if (!product) {
    return c.json({ message: "Product not found" }, 404);
  }
  return c.json({ product });
});

productsApp.post(
  "/",
  zValidator("json", createProductSchema),
  async (c) => {
    const body = c.req.valid("json");
    const db = getDb(c.env);
    const productService = new ProductService(db);
    const created = await productService.createProduct(body);
    return c.json({ product: created }, 201);
  }
);

export { productsApp as productsRoutes };
