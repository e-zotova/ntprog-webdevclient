import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import WSClient from "../../websocket/WSClient";
import styles from "./ticker.module.scss";
import { Instrument, OrderSide } from "../../constants/Enums";
import { addOrder } from "../../redux/slices/orders";
import { setSelectedInstrument } from "../../redux/slices/selectedInstrument";
import Decimal from "decimal.js";
import { TickerData } from "../../types/types";
import { RootState } from "../../redux/store";

const Ticker = ({
  socket,
  tickerData,
  orderId,
  setOrderId,
}: {
  socket: WSClient | null;
  tickerData: TickerData;
  orderId: number;
  setOrderId: (orderId: number) => void;
}) => {
  const dispatch = useDispatch();
  const [amountValue, setAmountValue] = useState<Decimal | null>(null);
  const initialSelectedInstrument = useSelector(
    (state: RootState) => Instrument.eur_usd || state.selectedInstrument
  );
  const [instrument, setInstrument] = useState(initialSelectedInstrument);
  const instrumentKeys = Object.keys(Instrument).filter((key) =>
    isNaN(Number(key))
  );
  const [currency, setCurrency] = useState<{ buy: Decimal; sell: Decimal }>({
    buy: new Decimal(0),
    sell: new Decimal(0),
  });

  // update order id when new order is added to the table
  useEffect(() => {
    localStorage.setItem("nextOrderId", orderId.toString());
  }, [orderId]);

  // set currency data
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

  // set selected instrument
  const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedInstrumentValue = parseInt(event.target.value);
    dispatch(setSelectedInstrument(instrument));
    setInstrument(selectedInstrumentValue);
  };

  // subscribe to market data
  useEffect(() => {
    setInstrument(instrument);
    socket?.subscribeMarketData(instrument);
  }, [socket, setInstrument, instrument]);

  // place order
   const handlePlaceOrder = (
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
      price:
        orderSide === OrderSide.sell
          ? currency.sell.toString() || "0"
          : currency.buy.toString() || "0",
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
          data-testid="dropdown"
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
          value={amountValue !== null ? amountValue.toNumber() : ""}
          onChange={(e) => {
            let newValue = e.target.value;
            if (newValue === "") {
              setAmountValue(null);
            } else if (newValue.match(/^\d+$/)) {
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
              onClick={(e) => handlePlaceOrder(e, OrderSide.sell)}
              disabled={!amountValue || amountValue.eq(0)}
            >
              Sell
            </button>

            <button
              type="submit"
              className={`${styles.button} ${styles.button__buy}`}
              onClick={(e) => handlePlaceOrder(e, OrderSide.buy)}
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
