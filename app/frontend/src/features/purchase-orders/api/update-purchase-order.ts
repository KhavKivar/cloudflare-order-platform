import httpClient from "@/lib/api-provider";

type UpdatePurchaseOrderInput = {
  id: number;
  orderListIds: number[];
};

export const updatePurchaseOrder = async (
  payload: UpdatePurchaseOrderInput,
) => {
  const res = await httpClient.patch(`/purchase_orders/${payload.id}`, {
    orderListIds: payload.orderListIds,
  });

  return res.data;
};
