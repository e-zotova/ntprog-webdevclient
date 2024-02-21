import { useState } from "react";
import { rowsPerPage } from "../../constants/constants";
import { IOrder } from "../../redux/slices/orders";

const usePagination = (initialPage: number, items: IOrder[]) => {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const indexOfLastOrder = currentPage * rowsPerPage;
  const indexOfFirstOrder = indexOfLastOrder - rowsPerPage;
  const currentOrders = items.length > 0 ? items.slice(indexOfFirstOrder, indexOfLastOrder) : [];

  const totalPages = Math.ceil(items.length / rowsPerPage);

  const nextPage = () => {
    setCurrentPage((prevPage) => Math.min(prevPage + 1, totalPages));
  };

  const prevPage = () => {
    setCurrentPage((prevPage) => Math.max(prevPage - 1, 1));
  };
  return { currentPage, currentOrders, totalPages, nextPage, prevPage };
};

export default usePagination;
