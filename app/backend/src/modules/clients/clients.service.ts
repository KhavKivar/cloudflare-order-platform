import { eq, or } from "drizzle-orm";
import { DrizzleD1Database } from "drizzle-orm/d1";
import { clients } from "../../db/schema.js";
import { CLIENT_EXISTS, CLIENT_NOT_FOUND } from "../../utils/error_enum.js";
import { Optional } from "../../utils/types.js";
import {
  Client,
  CreateClientInput,
  UpdateClientInput,
} from "./clients.schema.js";

export class ClientService {
  constructor(private readonly db: DrizzleD1Database<any>) {}

  async getClientById(id: number): Promise<Optional<Client>> {
    const [client] = await this.db
      .select()
      .from(clients)
      .where(eq(clients.id, id))
      .all();

    return (client as Client) ?? null;
  }

  async getClientByPhone(phone: string): Promise<Optional<Client>> {
    const [client] = await this.db
      .select()
      .from(clients)
      .where(eq(clients.phone, phone))
      .all();

    return (client as Client) ?? null;
  }

  async getClientByPhoneId(phoneId: string): Promise<Optional<Client>> {
    const [client] = await this.db
      .select()
      .from(clients)
      .where(eq(clients.phoneId, phoneId))
      .all();

    return (client as Client) ?? null;
  }

  async listClients(): Promise<Client[]> {
    const results = await this.db.select().from(clients).all();
    return results as Client[];
  }

  async createClient(input: CreateClientInput): Promise<Client> {
    try {
      // D1 doesn't throw on unique constraints in the same way Postgres does with codes
      // But we can check beforehand or catch the generic error
      const results = await this.db
        .insert(clients)
        .values({
          localName: input.localName,
          address: input.address,
          phone: input.phone,
          phoneId: input.phoneId ?? null,
        })
        .returning();

      return results[0] as Client;
    } catch (error: any) {
      if (error.message?.includes("UNIQUE constraint failed")) {
        throw new Error(CLIENT_EXISTS);
      }
      throw error;
    }
  }

  async updateClient(id: number, input: UpdateClientInput): Promise<Client> {
    const cleanInput = Object.fromEntries(
      Object.entries(input).filter(([_, value]) => value !== undefined),
    );

    if (Object.keys(cleanInput).length === 0) {
      const client = await this.getClientById(id);
      if (client == null) {
        throw new Error(CLIENT_NOT_FOUND);
      }
      return client;
    }

    const results = await this.db
      .update(clients)
      .set(cleanInput)
      .where(eq(clients.id, id))
      .returning();

    if (results.length === 0) {
      throw new Error(CLIENT_NOT_FOUND);
    }
    return results[0] as Client;
  }

  async deleteClient(id: number): Promise<Client> {
    try {
      const results = await this.db
        .delete(clients)
        .where(eq(clients.id, id))
        .returning();

      if (results.length === 0) {
        throw new Error(CLIENT_NOT_FOUND);
      }
      return results[0] as Client;
    } catch (error: any) {
      if (error.message?.includes("FOREIGN KEY constraint failed")) {
        throw new Error("Client has orders");
      }
      throw error;
    }
  }
}
