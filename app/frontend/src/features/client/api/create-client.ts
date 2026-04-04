import httpClient from "@/lib/api-provider";
import z from "zod";
import type { Client } from "./client.schema";

export const CreateClientDtoSchema = z.object({
  localName: z.string().nonempty("El nombre del local es obligatorio"),
  address: z.string().nonempty("La direccion es obligatoria"),
  phone: z
    .string()
    .regex(
      /^9\d{8}$/,
      "Ingresá solo los 9 dígitos (ej: 912345678)",
    ),
  phoneId: z.string().optional().default(""),
});

export type CreateClientDto = z.infer<typeof CreateClientDtoSchema>;

export const createClient = async (
  createdDto: CreateClientDto,
): Promise<Client> => {
  const res = await httpClient.post("/clients", createdDto);

  return res.data;
};
