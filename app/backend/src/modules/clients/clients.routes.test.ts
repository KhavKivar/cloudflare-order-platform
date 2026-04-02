import { sql } from "drizzle-orm";
import Fastify from "fastify";
import {
  serializerCompiler,
  validatorCompiler,
} from "fastify-type-provider-zod";
import { beforeAll, beforeEach, describe, expect, it } from "vitest";

import { clientsRoutes } from "./index.js";

describe("Client Routes ", () => {
  let app: Fastify.FastifyInstance;
  beforeAll(async () => {
    app = Fastify();
    app.setValidatorCompiler(validatorCompiler);
    app.setSerializerCompiler(serializerCompiler);
    app.decorate("db", (await import("../../db/index.js")).db); // gets the mocked one2
    await app.register(clientsRoutes, { prefix: "/clients" });
  });
  beforeEach(async () => {
    await app.db.execute(sql`TRUNCATE TABLE clients RESTART IDENTITY CASCADE;`);
  });

  describe("Get (Get/Clients)", () => {
    it("should return a list of clients", async () => {
      const client = await app.inject({
        method: "GET",
        url: "/clients",
      });
      expect(client.statusCode).toBe(200);
      expect(client.json().clients).toBeDefined();
    });
    it("should return a client with a client exist with phone", async () => {
      const clientCreated = await app.inject({
        method: "POST",
        url: "/clients",
        payload: {
          localName: "Client 1",
          address: "Address 1",
          phone: "56974586525",
          phoneId: "id123456789",
        },
      });
      const client = await app.inject({
        method: "GET",
        url: `/clients/phone/${clientCreated.json().client.phone}`,
      });
      expect(client.statusCode).toBe(200);
      expect(client.json().client).toBeDefined();
    });
    it("should return a client with a client exist with phoneId", async () => {
      const clientCreated = await app.inject({
        method: "POST",
        url: "/clients",
        payload: {
          localName: "Client 1",
          address: "Address 1",
          phone: "56974586525",
          phoneId: "id123456789",
        },
      });
      const client = await app.inject({
        method: "GET",
        url: `/clients/phoneId/${clientCreated.json().client.phoneId}`,
      });
      expect(client.statusCode).toBe(200);
      expect(client.json().client).toBeDefined();
    });
  });

  describe("Create (Post/Clients)", () => {
    it("should create a client and return it in the response with 201 code", async () => {
      const client = await app.inject({
        method: "POST",
        url: "/clients",
        payload: {
          localName: "Client 1",
          address: "Address 1",
          phone: "56974586525",
          phoneId: "id123456789",
        },
      });
      expect(client.statusCode).toBe(201);
      expect(client.json().client).toBeDefined();
    });
    it("should response with 400 if phone is invalid", async () => {
      const client = await app.inject({
        method: "POST",
        url: "/clients",
        payload: {
          localName: "Client 1",
          address: "Address 1",
          phone: "133133113",
          phoneId: "id123456789",
        },
      });
      expect(client.statusCode).toBe(400);
      expect(client.json().message).toBe(
        "body/phone Phone must be a valid Chilean mobile number (e.g., 56912345678)",
      );
    });
    it("should response with 409 if client already exists", async () => {
      const client = await app.inject({
        method: "POST",
        url: "/clients",
        payload: {
          localName: "Client 1",
          address: "Address 1",
          phone: "56974586525",
          phoneId: "id123456789",
        },
      });
      const client2 = await app.inject({
        method: "POST",
        url: "/clients",
        payload: {
          localName: "Client 2",
          address: "Address 2",
          phone: "56974586525",
          phoneId: "id123456789",
        },
      });

      expect(client2.statusCode).toBe(409);
      expect(client2.json().message).toBe(
        "A client with this phone or phoneId already exists",
      );
    });
  });
  describe("Patch (Patch/Clients)", () => {
    it("should update a client", async () => {
      const client = await app.inject({
        method: "POST",
        url: "/clients",
        payload: {
          localName: "Client 1",
          address: "Address 1",
          phone: "56974586525",
          phoneId: "id123456789",
        },
      });
      const updatedClient = await app.inject({
        method: "PATCH",
        url: `/clients/${client.json().client.id}`,
        payload: {
          localName: "Client 1 Updated",
          address: "Address 1 Updated",
          phone: "56974586525",
          phoneId: "id123456789",
        },
      });
      expect(updatedClient.statusCode).toBe(200);
      expect(updatedClient.json().client).toBeDefined();
    });
    it("should allow to partial update", async () => {
      const client = await app.inject({
        method: "POST",
        url: "/clients",
        payload: {
          localName: "Client 1",
          address: "Address 1",
          phone: "56974586525",
          phoneId: "id123456789",
        },
      });
      const updatedClient = await app.inject({
        method: "PATCH",
        url: `/clients/${client.json().client.id}`,
        payload: {
          localName: "Client 1 Updated",
        },
      });
      expect(updatedClient.statusCode).toBe(200);
      expect(updatedClient.json().client).toBeDefined();
    });
    it("should return the client, if a empty list is provide for update", async () => {
      const client = await app.inject({
        method: "POST",
        url: "/clients",
        payload: {
          localName: "Client 1",
          address: "Address 1",
          phone: "56974586525",
          phoneId: "id123456789",
        },
      });
      const updatedClient = await app.inject({
        method: "PATCH",
        url: `/clients/${client.json().client.id}`,
        payload: {},
      });
      expect(updatedClient.statusCode).toBe(200);
      expect(updatedClient.json().client).toBeDefined();
    });
  });

  describe("Delete (Delete/Clients)", () => {
    it("should remove a client when id is provide", async () => {
      const client = await app.inject({
        method: "POST",
        url: "/clients",
        payload: {
          localName: "Client 1",
          address: "Address 1",
          phone: "56974586525",
          phoneId: "id123456789",
        },
      });
      const deleteClient = await app.inject({
        method: "DELETE",
        url: `/clients/${client.json().client.id}`,
      });
      expect(deleteClient.statusCode).toBe(200);
      expect(deleteClient.json().client).toBeDefined();
    });
    it("should response with 404 when id is not found", async () => {
      const deleteClient = await app.inject({
        method: "DELETE",
        url: `/clients/24`,
      });

      expect(deleteClient.statusCode).toBe(404);
    });
  });
});
