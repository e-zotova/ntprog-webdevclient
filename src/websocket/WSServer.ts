import { Server, Client } from "mock-socket";
import CurrencyDataManager from "../components/helpers/currencyDataManager";
import {
  ClientMessageType,
  ServerMessageType,
  OrderStatus,
  Instrument,
} from "../constants/Enums";
import { MarketDataUpdate } from "../Models/ServerMessages";
import Decimal from "decimal.js";
import { timeoutValue, subsriptionId } from "../constants/constants";

export default class MockWSServer {
  private mockServer: Server;
  private currencyDataManager: CurrencyDataManager;
  private intervalId: ReturnType<typeof setInterval> | null;

  constructor() {
    this.mockServer = new Server("ws://localhost:3000/ws");
    this.mockServer.on("connection", this.handleConnection.bind(this));
    this.currencyDataManager = new CurrencyDataManager();
    this.intervalId = null;
  }

  private getResponse(instrument: Instrument, subscriptionId: string) {
    const currencyData = this.currencyDataManager.getCurrencyData(instrument);

    if (currencyData) {
      const bid: Decimal = currencyData.bid;
      const offer: Decimal = currencyData.offer;
      const minAmount: Decimal = currencyData.minAmount;
      const maxAmount: Decimal = currencyData.maxAmount;

      const response = {
        messageType: ServerMessageType.marketDataUpdate,
        message: {
          subscriptionId: subscriptionId,
          instrument: instrument,
          quotes: [{ bid, offer, minAmount, maxAmount }],
        } as MarketDataUpdate,
      };

      return response;
    }
  }

  private handleConnection(socket: Client): void {
    console.log("Mock server connected.");

    socket.on(
      "message",
      (message: string | Blob | ArrayBuffer | ArrayBufferView) => {
        if (typeof message === "string") {
          try {
            const data = JSON.parse(message);

            if (data.messageType === ClientMessageType.subscribeMarketData) {
              console.log("Received market data request:", data);

              socket.send(
                JSON.stringify({
                  messageType: ServerMessageType.success,
                  message: {
                    subscriptionId: subsriptionId,
                  },
                })
              );

              const instrument = data.message.instrument;
              const response = this.getResponse(instrument, subsriptionId);
              socket.send(JSON.stringify(response));

              const intervalCallback = () => {
                const updateResponse = this.getResponse(
                  instrument,
                  subsriptionId
                );
                socket.send(JSON.stringify(updateResponse));
              };

              if (this.intervalId) {
                clearInterval(this.intervalId);
              }

              this.intervalId = setInterval(intervalCallback, 1700);
            } else if (data.messageType === ClientMessageType.placeOrder) {
              console.log("Received place order:", data);

              const orderStatusValues = Object.values(OrderStatus).filter(
                (value) => typeof value === "number"
              );
              const randomIndex =
                Math.floor(Math.random() * orderStatusValues.length) + 1;

              const response = {
                messageType: ServerMessageType.executionReport,
                message: {
                  id: data.message.id,
                  updatedDate: new Date(
                    Date.now() + timeoutValue
                  ).toLocaleString(),
                  orderStatus: randomIndex,
                },
              };

              setTimeout(() => {
                socket.send(JSON.stringify(response));
                console.log("Sent response:", response);
              }, timeoutValue);
            }
          } catch (error) {
            console.error("Error parsing JSON:", error);
            socket.send(
              JSON.stringify({
                messageType: ServerMessageType.error,
                reason: "Invalid JSON format",
              })
            );
          }
        }
      }
    );
  }

  stop(): void {
    this.mockServer.stop();
  }
}
