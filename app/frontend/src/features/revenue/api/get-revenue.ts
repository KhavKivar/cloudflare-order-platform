import httpClient from "@/lib/api-provider";
import type { Revenue } from "./revenue-schema";

export type RevenueResponse = {
  revenue: Revenue[];
};

export const getRevenue = async (): Promise<RevenueResponse> => {
  const res = await httpClient.get("/revenue");

  const data: RevenueResponse = res.data;
  const revenueList = data.revenue.sort((a, b) => a.day.localeCompare(b.day));

  return { revenue: revenueList };
};
