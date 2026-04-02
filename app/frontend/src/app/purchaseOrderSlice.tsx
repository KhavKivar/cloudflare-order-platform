import type { OrderListItem } from "@/features/orders/api/get-orders";
import { createSlice } from "@reduxjs/toolkit";
import type { RootState } from "./store";

interface purchaseOrderStateProps {
  selectedPurchaseOrder: OrderListItem[];
}
const initialState: purchaseOrderStateProps = {
  selectedPurchaseOrder: [],
};
const purchaseOrderSlice = createSlice({
  name: "purchaseOrder",
  initialState,
  reducers: {
    setSelectedPurchaseOrder: (state, action) => {
      state.selectedPurchaseOrder = action.payload;
    },
    cleanSelectedPurchaseOrder: (state) => {
      state.selectedPurchaseOrder = [];
    },
    addSelectedPurchaseOrder: (state, action) => {
      state.selectedPurchaseOrder.push(action.payload);
    },
    removeSelectedPurchaseOrder: (state, action) => {
      state.selectedPurchaseOrder = state.selectedPurchaseOrder.filter(
        (order) => order.orderId !== action.payload.orderId,
      );
    },
  },
});

export const {
  setSelectedPurchaseOrder,
  addSelectedPurchaseOrder,
  cleanSelectedPurchaseOrder,
  removeSelectedPurchaseOrder,
} = purchaseOrderSlice.actions;

export const selectedPurchaseOrder = (state: RootState) =>
  state.purchaseOrders.selectedPurchaseOrder;

export default purchaseOrderSlice.reducer;
