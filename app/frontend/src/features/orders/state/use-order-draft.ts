import { create } from "zustand";
import type { Client } from "@/features/client/api/client.schema";
import type { OrderCreateDto } from "@/features/orders/api/order.schema";
import type { Product } from "@/features/orders/api/product.schema";

type OrderDraft = {
  order?: OrderCreateDto;
  selectClient?: Client | null;
  selectProduct?: Product | null;
  formValues?: { pricePerUnit: string; quantity: string; item: string };
};

type OrderDraftStore = {
  draft: OrderDraft | null;
  setDraft: (d: OrderDraft) => void;
  clearDraft: () => void;
};

export const useOrderDraftStore = create<OrderDraftStore>((set) => ({
  draft: null,
  setDraft: (d) => set({ draft: d }),
  clearDraft: () => set({ draft: null }),
}));
