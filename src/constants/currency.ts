export interface CurrencyData {
  buy: number;
  sell: number;
}

export function getCurrencyData(instrument: string): CurrencyData | null {
  switch (instrument) {
    case "eur_usd":
      return { buy: 1.2, sell: 1.3 };
    case "eur_rub":
      return { buy: 90, sell: 95 };
    case "usd_rub":
      return { buy: 70, sell: 75 };
    default:
      return null;
  }
}