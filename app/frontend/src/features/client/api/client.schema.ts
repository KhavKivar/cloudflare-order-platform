import z from "zod";

export const clientSchema = z.object({
  id: z.string(),
  name: z.string(),
  localName: z.string(),
  address: z.string(),
  phone: z.string(),
  phoneId: z.string(),
});

export type Client = z.infer<typeof clientSchema>;
