import httpClient from "@/lib/api-provider";

interface OrderCreateDTO {
  clientId: number;
  items: {
    productId: number;
    quantity: number;
    pricePerUnit: number;
  }[];
}

export const createOrder = async (payload: OrderCreateDTO) => {
  const requestBody = {
    clientId: payload.clientId,
    items: payload.items.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
      pricePerUnit: item.pricePerUnit,
    })),
  };

  const res = await httpClient.post("/orders", requestBody);

  return res.data;
};
