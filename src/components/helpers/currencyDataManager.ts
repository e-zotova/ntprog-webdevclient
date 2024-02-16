export interface CurrencyData {
  buy: number;
  sell: number;
}

const INTERVAL = 1000;

export default class CurrencyDataManager {
  private currencyData: { [key: string]: CurrencyData } = {};

  constructor() {
    this.initializeCurrencyData();
    setInterval(this.updateCurrencyData.bind(this), INTERVAL);
  }

  private initializeCurrencyData(): void {
    this.currencyData = {
      "1": { buy: 1.2, sell: 1.3 },
      "2": { buy: 90, sell: 95 },
      "3": { buy: 70, sell: 75 }
    };
  }

  public getCurrencyData(instrument: string): CurrencyData | null {
    return this.currencyData[instrument] || null;
  }

  private getRandomNumberInRange(min: number, max: number): number {
    const precision = 4;
    const range = max - min;
    const randomValue = min + Math.random() * range;
    return parseFloat(randomValue.toFixed(precision));
  }

  private generateRandomCurrencyData(minValue: number, maxValue: number): CurrencyData {
    return {
      buy: this.getRandomNumberInRange(minValue, maxValue),
      sell: this.getRandomNumberInRange(minValue, maxValue)
    };
  }

  private updateCurrencyData(): void {
    Object.keys(this.currencyData).forEach(instrument => {
      const { buy } = this.currencyData[instrument];
      const min = buy - 0.1;
      const max = buy + 0.1;
      this.currencyData[instrument] = this.generateRandomCurrencyData(min, max);
    });
  }
}
