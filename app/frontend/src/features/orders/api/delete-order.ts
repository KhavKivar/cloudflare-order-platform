import httpClient from "@/lib/api-provider";

export const deleteOrder = async (orderId: number) => {
  const res = await httpClient.delete(`/orders/${orderId}`);

  return res.data;
};
