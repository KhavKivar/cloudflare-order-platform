import httpClient from "@/lib/api-provider";
import z from "zod";
import type { Client } from "./client.schema";

export const CreateClientDtoSchema = z.object({
  localName: z.string().nonempty("El nombre del local es obligatorio"),
  address: z.string().nonempty("La direccion es obligatoria"),
  phone: z
    .string()
    .regex(
      /^569\d{8}$/,
      "El teléfono debe ser un celular chileno válido (ej: 56912345678)",
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
