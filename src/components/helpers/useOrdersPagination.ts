import { useState } from "react";
import { rowsPerPage } from "../../constants/constants";
import { IOrder } from "../../types/types";

const useOrdersPagination = (initialPage: number, orders: IOrder[]) => {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const indexOfLastOrder = currentPage * rowsPerPage;
  const indexOfFirstOrder = indexOfLastOrder - rowsPerPage;
  const currentOrders =
    orders?.length > 0 ? orders.slice(indexOfFirstOrder, indexOfLastOrder) : [];
    const totalPages = Math.ceil((orders?.length ?? 0) / rowsPerPage);

  const nextPage = () => {
    setCurrentPage((prevPage) => Math.min(prevPage + 1, totalPages));
  };

  const prevPage = () => {
    setCurrentPage((prevPage) => Math.max(prevPage - 1, 1));
  };
  return { currentPage, currentOrders, totalPages, nextPage, prevPage };
};

export default useOrdersPagination;
