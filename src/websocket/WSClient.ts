import {ClientMessage} from "../Models/ClientMessages";
import {ClientMessageType, Instrument, OrderSide, ServerMessageType} from "../constants/Enums";
import Decimal from "decimal.js";
import {ServerEnvelope} from "../Models/ServerMessages";

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

    this.connection.onerror = () => {
      console.log('Connection error');
    };

    this.connection.onopen = () => {
      console.log('Connected!');
      console.log('Connection state:', this.connection?.readyState);
      this.connection?.send(JSON.stringify({ message: "Hello, client!" }));
    };

    this.connection.onmessage = (event) => {
      console.log('Received message:', event.data);
      const message: ServerEnvelope = JSON.parse(event.data);
      switch (message.messageType) {
        case ServerMessageType.success:
          console.log('Success');
          break;
        case ServerMessageType.error:
          console.log('Error');
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
}
