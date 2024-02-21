import { Key, useEffect } from "react";
import { useSelector } from "react-redux";
import { IOrder, ordersSelect } from "../../redux/slices/orders";
import { OrderSide, OrderStatus, Instrument } from "../../constants/Enums";
import { columns } from "../../constants/constants";
import useOrdersPagination from "../../components/helpers/useOrdersPagination";
import styles from "./orderTable.module.scss";

const OrderTable = ({ orderId, setOrderId }: { orderId: number, setOrderId: (id: number) => void }) => {
  const { orders } = useSelector(ordersSelect);

  // set orders in local storage
  useEffect(() => {
    if (orders.length > 0) {
      localStorage.setItem("orders", JSON.stringify(orders));
      const lastOrderIndex = orders.length - 1;
      setOrderId(orders[lastOrderIndex].id + 1);
    }
  }, [orders, setOrderId]);

  // capitalize first letter of string
  const capitalizeFirstLetter = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  // set order color
  const setOrderColor = (order: IOrder) => {
    return order.side === OrderSide.buy
      ? styles.orderSideBuy
      : styles.orderSideSell;
  };

  // create pagination
  const { currentPage, currentOrders, totalPages, nextPage, prevPage } =
    useOrdersPagination(1, orders);

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
            currentOrders.map((order: IOrder, orderIndex: Key) => (
              <tr key={orderIndex}>
                <td>{order.id}</td>
                <td>{order.creationDate}</td>
                <td>{order.updatedDate}</td>
                <td>{capitalizeFirstLetter(OrderStatus[order.orderStatus])}</td>
                <td className={setOrderColor(order)}>
                  {capitalizeFirstLetter(OrderSide[order.side])}
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
