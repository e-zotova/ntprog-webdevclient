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
        console.log('Received data:', data);
        if (data && data.instrument) {
          const instrumentValue = data.instrument;
          console.log('Instrument:', instrumentValue);

          const currencyData = getCurrencyData(instrumentValue);
          console.log('Currency data:', currencyData);
          if (currencyData) {
            socket.send(JSON.stringify(currencyData));
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