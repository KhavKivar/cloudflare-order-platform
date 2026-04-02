import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { Bindings, getDb } from "../../db/index.js";
import {
  clientByPhoneSchema,
  clientByPhoneIdSchema,
  clientCreateSchema,
  clientUpdateSchema,
} from "./clients.schema.js";
import { ClientService } from "./clients.service.js";
import { CLIENT_EXISTS, CLIENT_NOT_FOUND } from "../../utils/error_enum.js";

const clientsApp = new Hono<{ Bindings: Bindings }>();

clientsApp.get("/", async (c) => {
  const db = getDb(c.env);
  const clientService = new ClientService(db);
  const clients = await clientService.listClients();
  return c.json({ clients });
});

clientsApp.get(
  "/phone/:phone",
  zValidator("param", clientByPhoneSchema),
  async (c) => {
    const { phone } = c.req.valid("param");
    const db = getDb(c.env);
    const clientService = new ClientService(db);
    const client = await clientService.getClientByPhone(phone);
    
    if (!client) {
      return c.json({ message: "Client not found by phone" }, 404);
    }
    return c.json({ client });
  }
);

clientsApp.get(
  "/phoneId/:phoneId",
  zValidator("param", clientByPhoneIdSchema),
  async (c) => {
    const { phoneId } = c.req.valid("param");
    const db = getDb(c.env);
    const clientService = new ClientService(db);
    const client = await clientService.getClientByPhoneId(phoneId);
    
    if (!client) {
      return c.json({ message: "Client not found by phoneId" }, 404);
    }
    return c.json({ client });
  }
);

clientsApp.post(
  "/",
  zValidator("json", clientCreateSchema),
  async (c) => {
    const body = c.req.valid("json");
    const db = getDb(c.env);
    const clientService = new ClientService(db);
    
    try {
      const created = await clientService.createClient(body);
      return c.json({ client: created }, 201);
    } catch (error: any) {
      if (error.message === CLIENT_EXISTS) {
        return c.json({ message: "A client with this phone or phoneId already exists" }, 409);
      }
      throw error;
    }
  }
);

clientsApp.patch(
  "/:id",
  zValidator("json", clientUpdateSchema),
  async (c) => {
    const id = parseInt(c.req.param("id"));
    const body = c.req.valid("json");
    const db = getDb(c.env);
    const clientService = new ClientService(db);
    
    try {
      const updated = await clientService.updateClient(id, body);
      return c.json({ client: updated });
    } catch (error: any) {
      if (error.message === CLIENT_NOT_FOUND) {
        return c.json({ message: "Client not found" }, 404);
      }
      throw error;
    }
  }
);

clientsApp.delete("/:id", async (c) => {
  const id = parseInt(c.req.param("id"));
  const db = getDb(c.env);
  const clientService = new ClientService(db);
  
  try {
    const deleted = await clientService.deleteClient(id);
    return c.json({ client: deleted });
  } catch (error: any) {
    if (error.message === CLIENT_NOT_FOUND) {
      return c.json({ message: "Client not found" }, 404);
    }
    if (error.message === "Client has orders") {
      return c.json({ message: "Client has orders" }, 409);
    }
    throw error;
  }
});

export { clientsApp as clientsRoutes };
