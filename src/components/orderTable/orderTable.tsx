
const OrderTable = ({ rowData = []}) => {
  return (
    <div>
      <table>
        <thead>
          <tr>
          </tr>
        </thead>
        <tbody>
          {rowData.map((row, rowIndex) => (
            <tr key={rowIndex}>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default OrderTable;
