import { useState } from "react";
import { useSelector } from "react-redux";
import { IOrder, ordersSelect } from "../../redux/slices/orders";
import { OrderSide, OrderStatus, Instrument } from "../../constants/Enums";
import { columns, rowsPerPage } from "../../constants/constants";
import { convertString } from "../helpers/helpers";
import styles from "./orderTable.module.scss";

const OrderTable = () => {
  const { orders } = useSelector(ordersSelect);
  localStorage.setItem("orders", JSON.stringify(orders));

  // localStorage.clear()

  const setOrderColor = (order: IOrder) => {
    return order.side === OrderSide.buy
      ? styles.orderSideBuy
      : styles.orderSideSell;
  };

  // pagination
  const [currentPage, setCurrentPage] = useState(1);
  const indexOfLastOrder = currentPage * rowsPerPage;
  const indexOfFirstOrder = indexOfLastOrder - rowsPerPage;
  const currentOrders = orders.slice(indexOfFirstOrder, indexOfLastOrder);

  const totalPages = Math.ceil(orders.length / rowsPerPage);

  const nextPage = () => {
    setCurrentPage((prevPage) => Math.min(prevPage + 1, totalPages));
  };

  const prevPage = () => {
    setCurrentPage((prevPage) => Math.max(prevPage - 1, 1));
  };

  return (
    <div className={styles.orderTableContainer}>
      <table className={styles.orderTable}>
        <thead>
          <tr>
            {columns.map((column, index) => (
              <th key={index}>{column.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {currentOrders.length === 0 ? (
            <tr>
              <td colSpan={columns.length}>No data</td>
            </tr>
          ) : (
            currentOrders.map((order, orderIndex) => (
              <tr key={orderIndex}>
                <td>{order.id}</td>
                <td>{order.creationDate}</td>
                <td>{order.updatedDate}</td>
                <td>{convertString(OrderStatus[order.orderStatus])}</td>
                <td className={setOrderColor(order)}>
                  {convertString(OrderSide[order.side])}
                </td>
                <td className={setOrderColor(order)}>
                  {order.price.toString()}
                </td>
                <td className={setOrderColor(order)}>
                  {parseFloat(order.amount).toFixed(2)}
                </td>
                <td>
                  {Instrument[order.instrument].replace("_", "/").toUpperCase()}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      {currentOrders.length !== 0 && (
        <div className={styles.pagination}>
          <button
            className={styles.button}
            onClick={prevPage}
            disabled={currentPage === 1}
          >
            &#8249;
          </button>
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <button
            className={styles.button}
            onClick={nextPage}
            disabled={currentPage === totalPages}
          >
            &#8250;
          </button>
        </div>
      )}
    </div>
  );
};

export default OrderTable;
