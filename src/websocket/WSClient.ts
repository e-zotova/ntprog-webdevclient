import {ClientMessage} from "../Models/ClientMessages";
import {ClientMessageType, Instrument, OrderSide, ServerMessageType} from "../constants/Enums";
import Decimal from "decimal.js";
import {ServerEnvelope, MarketDataUpdate} from "../Models/ServerMessages";

export default class WSClient {
  connection: WebSocket | undefined;

  constructor() {
    this.connection = undefined;
  }

  connect = () => {
    console.log('Connecting...');
    this.connection = new WebSocket('ws://localhost:3000/ws');

    this.connection.onclose = () => {
      this.connection = undefined;
    };

    this.connection.onerror = (err) => {
      console.log('Connection error:', err);
    };

    this.connection.onopen = () => {
      console.log('Connected!');
      console.log('Connection state:', this.connection?.readyState);
      this.connection?.send(JSON.stringify({ message: "Hello, server!" }));
      this.getOrders();
    };

    this.connection.onmessage = (event) => {
      const message: ServerEnvelope = JSON.parse(event.data);
      switch (message.messageType) {
        case ServerMessageType.success:
          console.log('Success');
          break;
        case ServerMessageType.error:
          console.log('Error:', message.message);
          break;
        case ServerMessageType.executionReport:
          console.log('Execution report');
          break;
        case ServerMessageType.marketDataUpdate:
          console.log('Market data update');
          break;
      }
    };
  }

  disconnect = () => {
    this.connection?.close();
    console.log('Disconnected.');
  }

  send = (message: ClientMessage) => {
    this.connection?.send(JSON.stringify(message));
  }

  subscribeMarketData = (instrument: Instrument) => {
    this.send({
      messageType: ClientMessageType.subscribeMarketData,
      message: {
        instrument,
      }
    });
  }

  unsubscribeMarketData = (subscriptionId: string) => {
    this.send({
      messageType: ClientMessageType.unsubscribeMarketData,
      message: {
        subscriptionId,
      }
    });
  }

  placeOrder = (instrument: Instrument, side: OrderSide, amount: Decimal, price: Decimal) => {
    this.send({
      messageType: ClientMessageType.placeOrder,
      message: {
        instrument,
        side,
        amount,
        price,
      }
    });
  }

  getOrders = () => {
    this.send({
      messageType: ClientMessageType.getOrders,
      message: {}
    })
  }
}
