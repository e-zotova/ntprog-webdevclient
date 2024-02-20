import React from "react";
import ReactDOM from "react-dom/client";
import { configureStore } from '@reduxjs/toolkit';
import { ordersReducer } from "./redux/slices/orders";
import { Provider } from "react-redux";
import { WSProvider } from "./websocket/WSProvider";
import "./index.css";
import App from "./App";

const store = configureStore({
  reducer: {
    orders: ordersReducer,
  },
});

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <React.StrictMode>
    <WSProvider>
      <Provider store={store}>
        <App />
      </Provider>
    </WSProvider>
  </React.StrictMode>
);
