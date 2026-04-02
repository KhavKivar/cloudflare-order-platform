import httpClient from "@/lib/api-provider";
import type { Client } from "./client.schema";

export type ClientsResponse = {
  clients: Client[];
};

export const getClients = async (): Promise<ClientsResponse> => {
  const res = await httpClient.get("/clients");

  const data: ClientsResponse = res.data;
  const clientsList = data.clients.sort((a, b) =>
    a.localName.localeCompare(b.localName),
  );

  return { clients: clientsList };
};
