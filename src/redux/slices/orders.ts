import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { IOrder, RootOrdersState, IOrders } from "../../types/types";

const initialState: IOrders = {
  orders: localStorage.getItem("orders")
    ? JSON.parse(localStorage.getItem("orders")!)
    : [],
};

const ordersSlice = createSlice({
  name: "@@orders",
  initialState,
  reducers: {
    addOrder: (state, action: PayloadAction<IOrder>) => {
      const newOrder: IOrder = action.payload;
      localStorage.setItem("orders", JSON.stringify(newOrder));
      return {
        ...state,
        orders: [...state.orders, newOrder],
      };
    },
    updateOrder: (state, action: PayloadAction<Partial<IOrder>>) => {
      const updatedOrder: Partial<IOrder> = action.payload;
      const index = state.orders.findIndex(
        (order) => order.id === updatedOrder.id
      );
      if (index !== -1) {
        state.orders[index] = {
          ...state.orders[index],
          ...updatedOrder,
        };
        localStorage.setItem("orders", JSON.stringify(state.orders[index]));
      }
    },
  },
});

export const { addOrder, updateOrder } = ordersSlice.actions;
export const ordersReducer = ordersSlice.reducer;
export const ordersSelect = (state: RootOrdersState) => state.orders;
