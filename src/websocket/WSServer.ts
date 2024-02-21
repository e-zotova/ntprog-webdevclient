import { Server, Client } from "mock-socket";
import CurrencyDataManager from "../components/helpers/currencyDataManager";
import {
  ClientMessageType,
  ServerMessageType,
  OrderStatus,
  Instrument,
} from "../constants/Enums";
import { MarketDataUpdate } from "../Models/ServerMessages";
import { timeoutValue, subsriptionId } from "../constants/constants";
import { Message } from "../Models/Base";

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

  // send subscription id
  private handleMarketDataSubsription(data: Message, socket: Client): void {
    console.log("Received market data request:", data);

    socket.send(
      JSON.stringify({
        messageType: ServerMessageType.success,
        message: {
          subscriptionId: subsriptionId,
        },
      })
    );
  }

  // send currency data for selected instrument
  private sendCurrencyData(
    socket: Client,
    instrument: Instrument,
    subscriptionId: string
  ) {
    const currencyData = this.currencyDataManager.getCurrencyData(instrument);
    if (currencyData) {
      const { bid, offer, minAmount, maxAmount } = currencyData;

      const response = {
        messageType: ServerMessageType.marketDataUpdate,
        message: {
          subscriptionId,
          instrument,
          quotes: [{ bid, offer, minAmount, maxAmount }],
        } as MarketDataUpdate,
      };

      socket.send(JSON.stringify(response));
    }
  }

  private getRandomOrderIndex(): number {
    const orderStatusValues = Object.values(OrderStatus).filter(
      (value) => typeof value === "number"
    );
    const randomIndex =
      Math.floor(Math.random() * orderStatusValues.length) + 1;
    return randomIndex;
  }

  // send order status and updated date after timeout
  private handlePlaceOrder(data: any, socket: Client): void {
    const response = {
      messageType: ServerMessageType.executionReport,
      message: {
        id: data.message.id,
        updatedDate: new Date(Date.now() + timeoutValue).toLocaleString(),
        orderStatus: this.getRandomOrderIndex(),
      },
    };

    setTimeout(() => {
      socket.send(JSON.stringify(response));
      console.log("Sent response:", response);
    }, timeoutValue);
  }

  private setupInterval(callback: () => void): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    this.intervalId = setInterval(callback, 1700);
  }

  private sendErrorMessage(socket: Client, reason: string): void {
    socket.send(
      JSON.stringify({ messageType: ServerMessageType.error, reason })
    );
  }

  private handleConnection(socket: Client): void {
    console.log("Mock server connected.");

    socket.on(
      "message",
      (message: string | Blob | ArrayBuffer | ArrayBufferView) => {
        if (typeof message === "string") {
          try {
            const data = JSON.parse(message);

            switch (data.messageType) {
              case ClientMessageType.subscribeMarketData:
                this.handleMarketDataSubsription(data, socket);
                const instrument = data.message.instrument;
                this.sendCurrencyData(socket, instrument, subsriptionId);

                const intervalCallback = () => {
                  this.sendCurrencyData(socket, instrument, subsriptionId);
                };
                this.setupInterval(intervalCallback);
                break;
              case ClientMessageType.placeOrder:
                this.handlePlaceOrder(data, socket);
                break;
              default:
                console.log("Unknown message type:", data.messageType);
            }
          } catch (error) {
            this.sendErrorMessage(socket, "Invalid JSON format");
          }
        }
      }
    );
  }

  stop(): void {
    this.mockServer.stop();
  }
}
