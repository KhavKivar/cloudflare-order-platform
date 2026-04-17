import { getPurchaseOrder } from "@/features/purchase-orders/api/get-purchase-order";
import { getPurchaseOrders } from "@/features/purchase-orders/api/get-purchase-orders";

export const purchaseOrderKeys = {
  all: ["purchase-orders"] as const,
  detail: (id: number) => ["purchase-order", id] as const,
};

export const purchaseOrderFns = {
  all: getPurchaseOrders,
  detail: (id: number) => () => getPurchaseOrder(id),
};
