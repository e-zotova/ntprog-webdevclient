import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import WSClient from "../../websocket/WSClient";
import styles from "./ticker.module.scss";
import { Instrument, OrderSide } from "../../constants/Enums";
import { addOrder } from "../../redux/slices/orders";
import { setSelectedInstrument } from "../../redux/slices/selectedInstrument";
import Decimal from "decimal.js";
import { TickerData } from "../../App";
import { RootState } from "../../redux/store";

const Ticker = ({
  socket,
  tickerData,
}: {
  socket: WSClient | null;
  tickerData: TickerData;
}) => {
  const dispatch = useDispatch();

  const instrumentKeys = Object.keys(Instrument).filter((key) =>
    isNaN(Number(key))
  );

  const initialSelectedInstrument = useSelector(
    (state: RootState) => Instrument.eur_usd || state.selectedInstrument
  );
  const [instrument, setInstrument] = useState(initialSelectedInstrument);

  const [amountValue, setAmountValue] = useState<Decimal | null>(null);
  const [currency, setCurrency] = useState<{ buy: Decimal; sell: Decimal }>({
    buy: new Decimal(0),
    sell: new Decimal(0),
  });

  const [orderId, setOrderId] = useState<number>(() => {
    const storedOrderId = localStorage.getItem("orders[orders.length].id");
    return storedOrderId ? parseInt(storedOrderId) : 1;
  });

  useEffect(() => {
    localStorage.setItem("orders[orders.length].id", orderId.toString());
  }, [orderId]);
  

  useEffect(() => {
    if (tickerData && tickerData.quotes) {
      const { bid, offer } = tickerData.quotes;
      setCurrency((prevCurrency) => ({
        ...prevCurrency,
        sell: new Decimal(bid),
        buy: new Decimal(offer),
      }));
    }
  }, [tickerData]);

  const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedInstrumentValue = parseInt(event.target.value);
    dispatch(setSelectedInstrument(instrument));
    setInstrument(selectedInstrumentValue);

  };

  useEffect(() => {
      setInstrument(instrument);
      socket?.subscribeMarketData(instrument);
    }, [socket, setInstrument, instrument]);

  const handleClick = (
    evt: React.MouseEvent<HTMLButtonElement>,
    orderSide: OrderSide
  ) => {
    evt.preventDefault();

    const newOrder = {
      id: orderId,
      creationDate: new Date().toLocaleString(),
      updatedDate: "",
      orderStatus: 1,
      side: orderSide,
      price: orderSide === OrderSide.sell ? currency.sell.toString() : currency.buy.toString(),
      amount: (amountValue ?? new Decimal(0)).toString(),
      instrument: instrument,
    };

    if (socket?.connection) {
      socket.placeOrder({
        ...newOrder,
        price: new Decimal(newOrder.price),
      });
    }
    setOrderId(orderId + 1);
    dispatch(addOrder(newOrder));
  };

  return (
    <div className={styles.ticker}>
      <form className={styles.ticker__form}>
        <label htmlFor="dropdown"></label>
        <select
          id="dropdown"
          className={styles.dropdown}
          value={instrument}
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
          min="0"
          value={amountValue !== null ? amountValue.toString() : ""}
          onChange={(e) => {
            const newValue = e.target.value;
            if (newValue === "" || parseFloat(newValue) < 0) {
              setAmountValue(null);
            } else {
              setAmountValue(new Decimal(newValue));
            }
          }}
        />

        <div className={styles.errorContainer}>
          {amountValue?.lessThanOrEqualTo(0) && (
            <p className={styles.error}>Amount must be greater than 0</p>
          )}
        </div>

        <div>
          <div className={styles.prices}>
            <div>
              <div className={styles.prices__current}>
                {currency.sell.toString()}
              </div>
            </div>
            <div>
              <div className={styles.prices__current}>
                {currency.buy.toString()}
              </div>
            </div>
          </div>

          <div className={styles.buttons}>
            <button
              type="submit"
              className={`${styles.button} ${styles.button__sell}`}
              onClick={(e) => handleClick(e, OrderSide.sell)}
              disabled={!amountValue || amountValue.eq(0)}
            >
              Sell
            </button>

            <button
              type="submit"
              className={`${styles.button} ${styles.button__buy}`}
              onClick={(e) => handleClick(e, OrderSide.buy)}
              disabled={!amountValue || amountValue.eq(0)}
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
