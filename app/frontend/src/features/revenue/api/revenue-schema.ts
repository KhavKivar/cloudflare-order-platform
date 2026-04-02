import z from "zod";

export const revenueSchema = z.object({
  day: z.string(),
  totalGain: z.string(),
});

export type Revenue = z.infer<typeof revenueSchema>;

export type RevenueResponse = {
  revenue: Revenue[];
};
