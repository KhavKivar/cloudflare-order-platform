import httpClient from "@/lib/api-provider";
import z from "zod";

import type { Client } from "./client.schema";

export const UpdateClientDtoSchema = z.object({
  localName: z.string().nonempty("El nombre del local es obligatorio"),
  address: z.string().nonempty("La direccion es obligatoria"),
  phone: z
    .string()
    .regex(
      /^569\d{8}$/,
      "El teléfono debe ser un celular chileno válido (ej: 56912345678)",
    ),
  phoneId: z.string().optional(),
});

export type UpdateClientDto = z.infer<typeof UpdateClientDtoSchema>;

export const updateClient = async (
  id: number | string,
  updateDto: UpdateClientDto,
): Promise<Client> => {
  const res = await httpClient.patch(`/clients/${id}`, updateDto);

  const response = res.data;

  return response.client ?? response;
};
