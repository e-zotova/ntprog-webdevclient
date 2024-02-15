import { columns } from "../../constants/constants";
import styles from "./orderTable.module.scss";

const OrderTable = ({ rowData = [] }) => {
  return (
<table className={styles.orderTable}>
  <thead>
    <tr>
      {columns.map((column, index) => (
        <th key={index}>{column.label}</th>
      ))}
    </tr>
  </thead>
  <tbody>
    {rowData.length === 0 ? (
      <tr>
        <td colSpan={columns.length}>No data</td>
      </tr>
    ) : (
      columns.map((column, columnIndex) => (
        <tr key={columnIndex}>
          {rowData.map((row, rowIndex) => (
            <td key={rowIndex}>{row[column.label]}</td>
          ))}
        </tr>
      ))
    )}
  </tbody>
</table>
  );
};

export default OrderTable;
