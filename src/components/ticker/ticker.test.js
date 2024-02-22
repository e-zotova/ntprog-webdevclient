import { render, fireEvent, screen } from "@testing-library/react";
import { toBeInTheDocument } from "@testing-library/jest-dom/matchers";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { ordersReducer } from "../../redux/slices/orders";
import { setSelectedInstrument } from "../../redux/slices/selectedInstrument";
import { useWebSocket } from "../../websocket/WSProvider";
import Ticker from "./ticker";
import Decimal from "decimal.js";

expect.extend({ toBeInTheDocument });

jest.mock("../../websocket/WSProvider", () => ({
  useWebSocket: jest.fn(),
}));

describe("Ticker component", () => {
  let mockSocket;
  let orderId;
  let setOrderId;
  let store;

  beforeEach(() => {
    mockSocket = {
      connection: true,
      placeOrder: jest.fn(),
      subscribeMarketData: jest.fn(),
    };
    orderId = 1;
    setOrderId = jest.fn();

    store = configureStore({
      reducer: {
        orders: ordersReducer,
        selectedInstrument: setSelectedInstrument,
      },
    });

    useWebSocket.mockReturnValue(mockSocket);
  });

  const renderWithProvider = (component) => {
    return render(<Provider store={store}>{component}</Provider>);
  };

  it("renders without errors", () => {
    renderWithProvider(
      <Ticker
        tickerData={{ quotes: { bid: 0, offer: 0 } }}
        orderId={orderId}
        setOrderId={setOrderId}
      />
    );

    expect(screen.getByDisplayValue("EUR/USD")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter amount"));
    const currency = screen.getAllByText("0");
    currency.forEach((element) => {
      expect(element).toBeInTheDocument();
    });
    expect(screen.getByText("Buy"));
    expect(screen.getByText("Sell"));
  });

  it("renders currency data correctly", () => {
    renderWithProvider(
      <Ticker
        tickerData={{ quotes: { bid: 1.2534, offer: 1.4634 } }}
        orderId={orderId}
        setOrderId={setOrderId}
      />
    );

    expect(screen.getByText("1.2534")).toBeInTheDocument();
    expect(screen.getByText("1.4634")).toBeInTheDocument();
  });

  it("change currency without errors", () => {
    renderWithProvider(
      <Ticker
        tickerData={{ quotes: { bid: 1.2534, offer: 1.4634 } }}
        orderId={orderId}
        setOrderId={setOrderId}
      />
    );

    expect(screen.getByDisplayValue("EUR/USD")).toBeInTheDocument();

    const dropdown = screen.getByTestId("dropdown");
    fireEvent.change(dropdown, { target: { value: 2 } });
    expect(dropdown.value).toBe("2");
    expect(screen.getByDisplayValue("EUR/RUB")).toBeInTheDocument();
  });

  it("should place a sell order when sell button is clicked", () => {
    renderWithProvider(
      <Ticker
        socket={mockSocket}
        tickerData={{ quotes: { bid: 1.2534, offer: 1.4634 } }}
        orderId={orderId}
        setOrderId={setOrderId}
      />
    );

    fireEvent.change(screen.getByPlaceholderText("Enter amount"), {
      target: { value: "100" },
    });
    fireEvent.click(screen.getByText("Sell"));

    expect(mockSocket.placeOrder).toHaveBeenCalled();
    expect(setOrderId).toHaveBeenCalled();
    expect(store.getState().orders.orders.length).toBeGreaterThan(0);
  });

  it("places sell order correctly", () => {
    renderWithProvider(
      <Ticker
        socket={mockSocket}
        tickerData={{ quotes: { bid: 1.2534, offer: 1.4634 } }}
        orderId={orderId}
        setOrderId={setOrderId}
      />
    );

    fireEvent.change(screen.getByPlaceholderText("Enter amount"), {
      target: { value: "1" },
    });
    fireEvent.click(screen.getByText("Sell"));

    expect(mockSocket.placeOrder).toHaveBeenCalledWith({
      id: 1,
      creationDate: new Date().toLocaleString(),
      updatedDate: "",
      orderStatus: 1,
      side: 2,
      price: new Decimal(1.2534),
      amount: "1",
      instrument: 1,
    });
  });

  it("should place a buy order when buy button is clicked", () => {
    renderWithProvider(
      <Ticker
        socket={mockSocket}
        tickerData={{ quotes: { bid: 70.2, offer: 70.4 } }}
        orderId={orderId}
        setOrderId={setOrderId}
      />
    );

    fireEvent.change(screen.getByPlaceholderText("Enter amount"), {
      target: { value: "10" },
    });
    fireEvent.click(screen.getByText("Buy"));

    expect(mockSocket.placeOrder).toHaveBeenCalled();
    expect(setOrderId).toHaveBeenCalled();
    expect(store.getState().orders.orders.length).toBeGreaterThan(0);
  });

  it("places buy order correctly", () => {
    renderWithProvider(
      <Ticker
        socket={mockSocket}
        tickerData={{ quotes: { bid: 90.2534, offer: 90.4634 } }}
        orderId={orderId}
        setOrderId={setOrderId}
      />
    );

    fireEvent.change(screen.getByPlaceholderText("Enter amount"), {
      target: { value: "1000000" },
    });
    fireEvent.click(screen.getByText("Buy"));

    expect(mockSocket.placeOrder).toHaveBeenCalledWith({
      id: 1,
      creationDate: new Date().toLocaleString(),
      updatedDate: "",
      orderStatus: 1,
      side: 1,
      price: new Decimal(90.4634),
      amount: "1000000",
      instrument: 1,
    });
  });

  it("should not place an order if socket connection is not available", () => {
    mockSocket.connection = false;

    renderWithProvider(
      <Ticker
        socket={mockSocket}
        tickerData={{ quotes: { bid: 1, offer: 1 } }}
        orderId={orderId}
        setOrderId={setOrderId}
      />
    );

    fireEvent.change(screen.getByPlaceholderText("Enter amount"), {
      target: { value: "10" },
    });
    fireEvent.click(screen.getByText("Buy"));

    expect(mockSocket.placeOrder).not.toHaveBeenCalled();
  });
});
