import { useState, useEffect } from "react";
import { useWebSocket } from '../../websocket/WSProvider';
import styles from"./ticker.module.scss";
import { Instrument } from "../../constants/Enums";

const Ticker = () => {
  const instrumentKeys = Object.keys(Instrument).filter(key => isNaN(Number(key)));
  const [selectedInstrument, setSelectedInstrument] = useState<Instrument | ''>('');

  const instrumentToStringMap = Object.fromEntries(
    Object.entries(Instrument)
      .filter(([key, value]) => !isNaN(Number(value)))
      .map(([key, value]) => [value, key])
  );

  const socket = useWebSocket();
  
  useEffect(() => {
    console.log("socket", socket);
    if (socket) {
      socket.send('Hello WebSocket');
    }

    if (selectedInstrument && socket) {
      const instrumentString = instrumentToStringMap[selectedInstrument];
      if (instrumentString) {
        const message = { instrument: instrumentString };
        socket.send(message);
      }
    }
  }, [socket, selectedInstrument, instrumentToStringMap]); 

  const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedInstrument(parseInt(event.target.value));
  };

  const handleClick = (evt: React.MouseEvent<HTMLButtonElement>) => {
    evt.preventDefault();
    
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
        <input type="number" className={styles.amount} placeholder="Enter amount" min="0"></input>
        <div className={styles.prices}>
          <div>
            <div className={styles.prices__current}>8.558</div>
            <button type="submit" className={`${styles.button} ${styles.button__sell}`} onClick={handleClick}>Sell</button>
          </div>
          <div>
            <div className={styles.prices__current}>8.559</div>
            <button type="submit" className={`${styles.button} ${styles.button__buy}`} onClick={handleClick}>Buy</button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Ticker;
