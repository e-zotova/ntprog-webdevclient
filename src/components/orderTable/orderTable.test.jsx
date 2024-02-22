import { render, screen } from "@testing-library/react";
import { toBeInTheDocument } from "@testing-library/jest-dom/matchers";
import { Provider, useSelector } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { ordersReducer, setOrders } from "../../redux/slices/orders";
import OrderTable from "./orderTable";

expect.extend({ toBeInTheDocument });

jest.mock("react-redux", () => ({
  ...jest.requireActual("react-redux"),
  useSelector: jest.fn(),
}));

describe("OrderTable component", () => {
  let setOrderId;
  let store;

  beforeEach(() => {
    setOrderId = jest.fn();

    store = configureStore({
      reducer: {
        orders: ordersReducer,
      },
    });

    useSelector.mockImplementation((selector) => selector(store.getState()));
  });

  const renderWithProvider = (component) => {
    return render(<Provider store={store}>{component}</Provider>);
  };

  it("renders without errors", () => {
    renderWithProvider(<OrderTable setOrderId={setOrderId} />);

    expect(screen.getByText("Id")).toBeInTheDocument();
    expect(screen.getByText("Creation time")).toBeInTheDocument();
    expect(screen.getByText("Change time")).toBeInTheDocument();
    expect(screen.getByText("Status")).toBeInTheDocument();
    expect(screen.getByText("Side")).toBeInTheDocument();
    expect(screen.getByText("Price")).toBeInTheDocument();
    expect(screen.getByText("Amount")).toBeInTheDocument();
    expect(screen.getByText("Instrument")).toBeInTheDocument();

    // expect to render "No data"
    expect(screen.getByText("No data")).toBeInTheDocument();
  });

  it("renders table with order", () => {
    const mockOrders = [
      {
        amount: "1",
        creationDate: "21/02/2024, 19:38:39",
        id: 1,
        instrument: 1,
        orderStatus: 2,
        price: "100",
        side: 2,
        updatedDate: "21/02/2024, 19:40:00",
      },
    ];

    store.dispatch(setOrders(mockOrders));

    renderWithProvider(<OrderTable setOrderId={setOrderId} />);

    // expect to render data when there are orders
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("21/02/2024, 19:38:39")).toBeInTheDocument();
    expect(screen.getByText("Filled")).toBeInTheDocument();
    expect(screen.getByText("Sell")).toBeInTheDocument();
    expect(screen.getByText("100")).toBeInTheDocument();
    expect(screen.getByText("1.00")).toBeInTheDocument();
    expect(screen.getByText("EUR/USD")).toBeInTheDocument();
  });
});
