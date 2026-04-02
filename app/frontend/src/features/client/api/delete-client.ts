import httpClient from "@/lib/api-provider";
import type { Client } from "./client.schema";

export const deleteClient = async (id: number | string): Promise<Client> => {
  try {
    const res = await httpClient.delete(`/clients/${id}`);
    const response = res.data;
    return response.client ?? response;
  } catch (error: unknown) {
    let message = "Error al eliminar el cliente";

    if (error && typeof error === "object" && "response" in error) {
      const axiosError = error as {
        response?: { data?: { message?: string } };
      };
      const errorData = axiosError.response?.data || {};

      if (errorData.message === "Client has orders") {
        throw new Error("El cliente tiene pedidos");
      }
      message = errorData.message || message;
    }

    throw new Error(message);
  }
};
