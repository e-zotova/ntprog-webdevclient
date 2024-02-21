import { Instrument } from "../../constants/Enums";
import { Quote } from "../../Models/Base";
import Decimal from "decimal.js";

export default class CurrencyDataManager {
  private currencyData: Record<number, Quote> = {};

  constructor() {
    this.initializeCurrencyData();
    this.updateCurrencyData.bind(this);
  }

  private initializeCurrencyData(): void {
    this.currencyData = {
      [Instrument.eur_usd]: {
        bid: new Decimal("1.2"),
        offer: new Decimal("1.3"),
        minAmount: new Decimal("1.2"),
        maxAmount: new Decimal("1.3"),
      },
      [Instrument.eur_rub]: {
        bid: new Decimal("90"),
        offer: new Decimal("95"),
        minAmount: new Decimal("90"),
        maxAmount: new Decimal("95"),
      },
      [Instrument.usd_rub]: {
        bid: new Decimal("70"),
        offer: new Decimal("75"),
        minAmount: new Decimal("70"),
        maxAmount: new Decimal("75"),
      },
    };
  }

  public getCurrencyData(instrument: Instrument): Quote | null {
    this.updateCurrencyData();
    const currencyData = this.currencyData[instrument] || null;

    return currencyData;
  }

  private getRandomNumberInRange(min: number, max: number): number {
    const precision = 4;
    const range = max - min;
    const actualMin = Math.max(0, min);
    const randomValue = actualMin + Math.random() * range;
    return parseFloat(randomValue.toFixed(precision));
  }

  private generateRandomCurrencyData(
    minValue: Decimal,
    maxValue: Decimal
  ): Quote {
    return {
      bid: new Decimal(
        this.getRandomNumberInRange(minValue.toNumber(), maxValue.toNumber())
      ),
      offer: new Decimal(
        this.getRandomNumberInRange(minValue.toNumber(), maxValue.toNumber())
      ),
      minAmount: new Decimal(
        this.getRandomNumberInRange(minValue.toNumber(), maxValue.toNumber())
      ),
      maxAmount: new Decimal(
        this.getRandomNumberInRange(minValue.toNumber(), maxValue.toNumber())
      ),
    };
  }

  private updateCurrencyData(): void {
    Object.keys(this.currencyData).forEach((key) => {
      const instrument = parseInt(key);
      const { bid } = this.currencyData[instrument];
      const min = new Decimal(bid).minus(0.1);
      const max = new Decimal(bid).plus(0.1);
      this.currencyData[instrument] = this.generateRandomCurrencyData(min, max);
    });
  }
}
