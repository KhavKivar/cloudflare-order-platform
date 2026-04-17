import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { clients } from "../../db/schema.js";
import { phoneRegex } from "../../utils/regex.js";

export const clientSchema = createSelectSchema(clients);

export type Client = z.infer<typeof clientSchema>;

export const clientByPhoneSchema = z.object({
  phone: z.string().regex(phoneRegex, {
    message: "Phone must be a valid Chilean mobile number (e.g., 56912345678)",
  }),
});

export const clientByPhoneIdSchema = z.object({
  phoneId: z.string().min(10, "PhoneId must be at least 10 characters long"),
});

export const clientByLocalNameSchema = z.object({
  localName: z.string().min(1),
});

export const clientCreateSchema = z.object({
  localName: z.string().min(4, "Local name must be at least 4 characters long"),
  address: z.string(),
  phone: z.string().min(5, "El teléfono o ID es muy corto"),
  phoneId: z.string().nullable().optional(),
});

export const clientUpdateSchema = z.object({
  localName: z.string().min(4, "Local name must be at least 4 characters long").optional(),
  address: z.string().optional(),
  phone: z.string().regex(phoneRegex, {
    message: "Phone must be a valid Chilean mobile number (e.g., 56912345678)",
  }).optional(),
  phoneId: z.string().nullable().optional(),
});

export type CreateClientInput = z.infer<typeof clientCreateSchema>;
export type UpdateClientInput = z.infer<typeof clientUpdateSchema>;
