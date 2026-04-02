import httpClient from "@/lib/api-provider";

interface PurchaseOrderCreateDTO {
  orderListIds: number[];
}

export const createPurchaseOrder = async (payload: PurchaseOrderCreateDTO) => {
  const requestBody = {
    orderListIds: payload.orderListIds,
  };

  const res = await httpClient.post("/purchase_orders", requestBody);

  return res.data;
};
