import { eq } from "drizzle-orm";
import { DrizzleD1Database } from "drizzle-orm/d1";
import { products } from "../../db/schema.js";
import { CreateProductInput, Product, UpdateProductInput } from "./products.schema.js";

export class ProductService {
  constructor(private readonly db: DrizzleD1Database<any>) {}

  async createProduct(input: CreateProductInput): Promise<Product> {
    const results = await this.db
      .insert(products)
      .values(input)
      .returning()
      .execute();

    return results[0] as Product;
  }

  async getProducts(): Promise<Product[]> {
    const results = await this.db.select().from(products).all();
    return results as Product[];
  }

  async getProductById(id: number): Promise<Product | null> {
    const [product] = await this.db
      .select()
      .from(products)
      .where(eq(products.id, id))
      .all();
    return (product as Product) ?? null;
  }

  async updateProduct(id: number, input: UpdateProductInput): Promise<Product | null> {
    const fields = Object.fromEntries(
      Object.entries(input).filter(([_, v]) => v !== undefined),
    );
    if (Object.keys(fields).length === 0) return this.getProductById(id);
    const [updated] = await this.db
      .update(products)
      .set(fields)
      .where(eq(products.id, id))
      .returning()
      .execute();
    return (updated as Product) ?? null;
  }
}
