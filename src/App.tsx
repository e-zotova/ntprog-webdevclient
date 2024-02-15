import "./App.css";
import Ticker from "./components/ticker/ticker";
import OrderTable from "./components/orderTable/orderTable";

function App() {
  return (
    <div className="App">
      <Ticker />
      <OrderTable />
    </div>
  );
}

export default App;
