import { sql } from "drizzle-orm";
import Fastify from "fastify";
import { beforeAll, beforeEach, describe, expect, it } from "vitest";

import { ClientService } from "./clients.service.js";

describe("Client Service", () => {
  let app: Fastify.FastifyInstance;
  let clientService: ClientService;

  beforeAll(async () => {
    app = Fastify();
    app.decorate("db", (await import("../../db/index.js")).db); // gets the mocked one
    clientService = new ClientService(app.db);
  });

  beforeEach(async () => {
    await app.db.execute(sql`TRUNCATE TABLE clients RESTART IDENTITY CASCADE;`);
  });

  it("should create a client", async () => {
    const client = await clientService.createClient({
      localName: "Client 1",
      address: "Address 1",
      phone: "123456789",
      phoneId: "123456789",
    });
    expect(client).not.toBeNull();
  });

  it("should not create a client if phone already exists", async () => {
    await clientService.createClient({
      localName: "Client 1",
      address: "Address 1",
      phone: "123456789",
      phoneId: "123456789",
    });
    await expect(
      clientService.createClient({
        localName: "Client 2",
        address: "Address 2",
        phone: "123456789",
        phoneId: "123456789",
      }),
    ).rejects.toThrow("CLIENT_EXISTS");
  });
  it("should not create a client if phone id already exist", async () => {
    await clientService.createClient({
      localName: "Client 1",
      address: "Address 1",
      phone: "12345612312321",
      phoneId: "123456789",
    });
    await expect(
      clientService.createClient({
        localName: "Client 2",
        address: "Address 2",
        phone: "12345678123129",
        phoneId: "123456789",
      }),
    ).rejects.toThrow("CLIENT_EXISTS");
  });
  it("shoudl return null if phone doest exist", async () => {
    const client = await clientService.getClientByPhone("123456789");
    expect(client).toBeNull();
  });
  it("shoudl return null if phone id doest exist", async () => {
    const client = await clientService.getClientByPhoneId("123456789");
    expect(client).toBeNull();
  });
  it("should return a list of clients", async () => {
    const clients = await clientService.listClients();
    expect(clients).toBeInstanceOf(Array);
  });
  it("should update a client", async () => {
    const client = await clientService.createClient({
      localName: "Client 1",
      address: "Address 1",
      phone: "123456789",
      phoneId: "123456789",
    });
    const updatedClient = await clientService.updateClient(client.id, {
      localName: "Client 1 Updated",
      address: "Address 1 Updated",
      phone: "123456789",
      phoneId: "123456789",
    });
    expect(updatedClient).not.toBeNull();
    expect(updatedClient.localName).toBe("Client 1 Updated");
    expect(updatedClient.address).toBe("Address 1 Updated");
  });
  it("should update a client when partial data is provided", async () => {
    const client = await clientService.createClient({
      localName: "Client 1",
      address: "Address 1",
      phone: "123456789",
      phoneId: "123456789",
    });
    const updatedClient = await clientService.updateClient(client.id, {
      localName: "Client 1 Updated",
    });
    expect(updatedClient).not.toBeNull();
    expect(updatedClient.localName).toBe("Client 1 Updated");
    expect(updatedClient.address).toBe("Address 1");
  });
  it("should update a client phone id when phone id is provided as null", async () => {
    const client = await clientService.createClient({
      localName: "Client 1",
      address: "Address 1",
      phone: "123456789",
      phoneId: "123456789",
    });
    const updatedClient = await clientService.updateClient(client.id, {
      phoneId: null,
    });
    expect(updatedClient).not.toBeNull();
    expect(updatedClient.phoneId).toBeNull();
  });
  it("should throw a error when updating a client that doesnt exist", async () => {
    await expect(
      clientService.updateClient(2442, {
        localName: "Client 1 Updated",
      }),
    ).rejects.toThrow("CLIENT_NOT_FOUND");
  });
  it("should return the client, when no updates are provided", async () => {
    const client = await clientService.createClient({
      localName: "Client 1",
      address: "Address 1",
      phone: "123456789",
      phoneId: "123456789",
    });
    const updatedClient = await clientService.updateClient(client.id, {});
    expect(updatedClient).not.toBeNull();
    expect(updatedClient.localName).toBe("Client 1");
    expect(updatedClient.address).toBe("Address 1");
    expect(updatedClient.phone).toBe("123456789");
    expect(updatedClient.phoneId).toBe("123456789");
  });
  it("should throw a error, when no updates are provided and the client doesnt exist", async () => {
    await expect(clientService.updateClient(2442, {})).rejects.toThrow(
      "CLIENT_NOT_FOUND",
    );
  });

  it("should delete a client", async () => {
    const client = await clientService.createClient({
      localName: "Client 1",
      address: "Address 1",
      phone: "123456789",
      phoneId: "123456789",
    });
    const deletedClient = await clientService.deleteClient(client.id);
    expect(deletedClient).not.toBeNull();
    expect(deletedClient.id).toBe(client.id);
  });
});
