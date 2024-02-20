import "./App.css";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { useWebSocket } from "./websocket/WSProvider";
import Ticker from "./components/ticker/ticker";
import OrderTable from "./components/orderTable/orderTable";
import { ServerMessageType } from "./constants/Enums";
import { updateOrder } from "./redux/slices/orders"; 

export interface TickerData {
  quotes: { bid: number; offer: number };
}

function App() {
  const socket = useWebSocket();
  const dispatch = useDispatch();
  const [tickerData, setTickerData] = useState<TickerData>({
    quotes: { bid: 0, offer: 0 },
  });

  const handleMessage = (event: MessageEvent) => {
    const data = JSON.parse(event.data);

    switch (data.messageType) {
      case ServerMessageType.success:
        console.log("Subscription successful:", data.message);
        break;

      case ServerMessageType.error:
        console.error("Subscription error:", data.message);
        break;

      case ServerMessageType.marketDataUpdate:
        console.log("Market data update:", data);
        setTickerData({ quotes: { bid: data.message.quotes[0].bid, offer: data.message.quotes[0].offer }})
        break;

      case ServerMessageType.executionReport:

        dispatch(updateOrder(data.message));
        break;
      }
  };

  if (socket?.connection) {
    socket.connection.onmessage = handleMessage;
  }


  return (
    <div className="App">
      <Ticker socket={socket} tickerData={tickerData} />
      <OrderTable />
    </div>
  );
}

export default App;
