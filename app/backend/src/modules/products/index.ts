import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { Bindings, getDb } from "../../db/index.js";
import { ProductService } from "./products.service.js";
import { createProductSchema, updateProductSchema } from "./products.schema.js";

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

productsApp.patch(
  "/:id",
  zValidator("json", updateProductSchema),
  async (c) => {
    const id = parseInt(c.req.param("id"));
    const body = c.req.valid("json");
    const db = getDb(c.env);
    const productService = new ProductService(db);
    const updated = await productService.updateProduct(id, body);
    if (!updated) {
      return c.json({ message: "Product not found" }, 404);
    }
    return c.json({ product: updated });
  }
);

export { productsApp as productsRoutes };
