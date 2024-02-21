import { configureStore } from "@reduxjs/toolkit";
import { ordersReducer } from "./slices/orders";
import selectedInstrument from "./slices/selectedInstrument";

export const store = configureStore({
  reducer: {
    orders: ordersReducer,
    selectedInstrument,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
