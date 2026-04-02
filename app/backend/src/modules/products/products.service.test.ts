import { sql } from "drizzle-orm";
import Fastify from "fastify";
import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import { ProductService } from "./products.service.js";

describe("Product Service", () => {
  let app: Fastify.FastifyInstance;
  let productService: ProductService;

  beforeAll(async () => {
    app = Fastify();
    app.decorate("db", (await import("../../db/index.js")).db); // gets the mocked one
    productService = new ProductService(app.db);
  });

  beforeEach(async () => {
    await app.db.execute(
      sql`TRUNCATE TABLE products RESTART IDENTITY CASCADE;`,
    );
  });

  it("should list all products", async () => {
    const products = await productService.getProducts();
    expect(products).toBeInstanceOf(Array);
  });

  it("should create a product", async () => {
    const product = await productService.createProduct({
      name: "Product 1",
      type: "product",
      buyPriceSupplier: 1,
      sellPriceClient: 1,
      batchSize: 1,
      sizeMl: null,
      description: null,
    });
    expect(product).not.toBeNull();
  });
});
