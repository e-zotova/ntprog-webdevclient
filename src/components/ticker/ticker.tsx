import { useState, useEffect } from "react";
import { useWebSocket } from "../../websocket/WSProvider";
import styles from "./ticker.module.scss";
import { Instrument, OrderSide } from "../../constants/Enums";
import Decimal from "decimal.js";

const Ticker = () => {
  const instrumentKeys = Object.keys(Instrument).filter((key) => isNaN(Number(key)));
  const [selectedInstrument, setSelectedInstrument] = useState<Instrument | "">(
    ""
  );
  const [amount, setAmount] = useState<Decimal | null>(null);
  const [currency, setCurrency] = useState<{ buy: Decimal; sell: Decimal }>({
    buy: new Decimal(0),
    sell: new Decimal(0),
  });
  const [touched, setTouched] = useState(false);

  const socket = useWebSocket();

  useEffect(() => {
    if (instrumentKeys.length > 0) {
      setSelectedInstrument(Instrument[instrumentKeys[0] as keyof typeof Instrument]);
    }
  }, [instrumentKeys]);

  useEffect(() => {
    if (socket?.connection) {
      const handleMessage = (event: MessageEvent) => {
        try {
          const data = JSON.parse(event.data);

          if (data && data.currencyData) {
            setCurrency(data.currencyData);
          }
        } catch (error) {
          console.error("Error parsing message data:", error);
        }
      };

      socket.connection.addEventListener("message", handleMessage);

      if (selectedInstrument) {
        socket.subscribeMarketData(selectedInstrument);
      }

      return () => {
        socket.connection?.removeEventListener("message", handleMessage);
      };
    }
  }, [socket, selectedInstrument, currency]);

  const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedInstrument(parseInt(event.target.value));
  };

  const handleClick = (
    evt: React.MouseEvent<HTMLButtonElement>,
    orderSide: OrderSide
  ) => {
    evt.preventDefault();
    if (selectedInstrument && amount?.greaterThan(0) && socket) {
      socket.placeOrder(
        selectedInstrument,
        orderSide,
        amount,
        orderSide === OrderSide.buy
          ? new Decimal(currency.buy)
          : new Decimal(currency.sell)
      );
    }
  };

  return (
    <div className={styles.ticker}>
      <form className={styles.ticker__form}>
        <label htmlFor="dropdown"></label>
        <select
          id="dropdown"
          className={styles.dropdown}
          value={selectedInstrument}
          onChange={handleSelectChange}
        >
          {instrumentKeys.map((key) => (
            <option
              key={key}
              value={Instrument[key as keyof typeof Instrument]}
              className={styles.option}
            >
              {key.replace("_", "/").toUpperCase()}
            </option>
          ))}
        </select>
        <input
          type="number"
          className={styles.amount}
          placeholder="Enter amount"
          min={0}
          value={amount !== null ? amount.toString() : ""}
          onChange={(e) => {
            const newValue = e.target.value;
            if (newValue === "") {
              setAmount(null);
            } else {
              setAmount(new Decimal(newValue));
            }
          }}
          onBlur={() => setTouched(true)}
        />

        {touched && amount && amount.eq(0) && (
          <p style={{ color: "red" }}>Value must be greater than 0</p>
        )}

        <div className={styles.prices}>
          <div>
            <div className={styles.prices__current}>
              {currency.sell.toString()}
            </div>
            <button
              type="submit"
              className={`${styles.button} ${styles.button__sell}`}
              onClick={(e) => handleClick(e, OrderSide.sell)}
              disabled={!amount || amount.eq(0)}
            >
              Sell
            </button>
          </div>
          <div>
            <div className={styles.prices__current}>
              {currency.buy.toString()}
            </div>
            <button
              type="submit"
              className={`${styles.button} ${styles.button__buy}`}
              onClick={(e) => handleClick(e, OrderSide.buy)}
              disabled={!amount || amount.eq(0)}
              >
              Buy
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Ticker;
