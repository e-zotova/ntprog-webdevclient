import { Instrument } from "../../constants/Enums";
import { Quote } from "../../Models/Base";
import Decimal from "decimal.js";

export default class CurrencyDataManager {
  private currencyData: Record<number, Quote> = {};
  private readonly precision: number = 4;

  constructor() {
    this.initializeCurrencyData();
  }

  private initializeCurrencyData(): void {
    const data: Record<Instrument, Quote> = {
      [Instrument.eur_usd]: this.generateQuote("1.2", "1.3"),
      [Instrument.eur_rub]: this.generateQuote("90", "95"),
      [Instrument.usd_rub]: this.generateQuote("70", "75"),
    };
    this.currencyData = data;
  }

  public getCurrencyData(instrument: Instrument): Quote | null {
    this.updateCurrencyData();
    return this.currencyData[instrument] || null;
  }

  private generateRandomNumberInRange(min: Decimal, max: Decimal): Decimal {
    const range = max.minus(min);
    const random = min.plus(range.times(Math.random()));
    return random.toDecimalPlaces(this.precision);
  }

  private generateQuote(bid: string, offer: string): Quote {
    const minValue = new Decimal(bid);
    const maxValue = new Decimal(offer);
    return {
      bid: this.generateRandomNumberInRange(minValue, maxValue),
      offer: this.generateRandomNumberInRange(minValue, maxValue),
      minAmount: minValue,
      maxAmount: maxValue,
    };
  }

  private updateCurrencyData(): void {
    Object.values(this.currencyData).forEach((quote) => {
      const { bid } = quote;
      const min = bid.minus(0.1);
      const max = bid.plus(0.1);
      Object.assign(quote, this.generateQuote(min.toString(), max.toString()));
    });
  }
}