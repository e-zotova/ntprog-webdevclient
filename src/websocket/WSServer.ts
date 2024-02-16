import { Server, Client } from "mock-socket";
import { getCurrencyData } from "../constants/currency";

export default class MockWSServer {
  private mockServer: Server;

  constructor() {
    this.mockServer = new Server("ws://localhost:3000/ws");
    this.mockServer.on("connection", this.handleConnection.bind(this));
  }

  private handleConnection(socket: Client): void {
    console.log("Mock server connected.");
    socket.send(JSON.stringify({ message: "Hello, client!" }));

    socket.on('message', (message: string | Blob | ArrayBuffer | ArrayBufferView) => {
      if (typeof message === 'string') {
        console.log('Mock server received message:', message);

        const data = JSON.parse(message);
        if (data && data.message.instrument) {
          const instrumentValue = data.message.instrument;

          const currencyData = getCurrencyData(instrumentValue);
          if (currencyData) {
              const response = {
                instrument: instrumentValue,
                currencyData: currencyData
              };
              socket.send(JSON.stringify(response));
          } else {
            socket.send(JSON.stringify({ error: 'Invalid instrument' }));
          }
        } else {
          socket.send(JSON.stringify({ error: 'Instrument not provided' }));
        }
      } else {
        console.log('Received non-string message:', message);
        socket.send(JSON.stringify({ error: 'Invalid message format' }));
      }
    });
  }

  stop(): void {
    this.mockServer.stop();
  }
}