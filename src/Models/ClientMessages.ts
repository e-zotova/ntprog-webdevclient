import {Envelope, Message} from "./Base";
import {ClientMessageType, Instrument, OrderSide, OrderStatus} from "../constants/Enums";
import Decimal from "decimal.js";

export interface ClientEnvelope extends Envelope {
    messageType: ClientMessageType
}

export interface ClientMessage extends Message {

}

export interface SubscribeMarketData extends ClientMessage {
    instrument: Instrument
}

export interface UnsubscribeMarketData extends ClientMessage {
    subscriptionId: string
}

export interface PlaceOrder extends ClientMessage {
    id: number
    creationDate: string,
    updatedDate: string,
    orderStatus: OrderStatus
    side: OrderSide
    price: Decimal
    amount: string
    instrument: Instrument
}
