import { Instrument } from "../constants/Enums";

export interface TickerData {
  quotes: { bid: number; offer: number };
}

export interface IOrder {
  id: number;
  creationDate: string;
  updatedDate: string;
  orderStatus: number;
  side: number;
  price: string;
  amount: string;
  instrument: Instrument;
}

export interface RootOrdersState {
  orders: IOrders;
}

export interface IOrders {
  orders: IOrder[];
}

export interface IPopup {
  id: string;
  isOpen: boolean;
}

export interface IPopupState {
  popups: IPopup[];
}