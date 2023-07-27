import { AppCurrency } from "../database/model/AppConfig";

export const getPriceDisplay: (price: number, currency: AppCurrency) => string =
  (price, currency) => {
    return `${currency.sign || ""}${Math.ceil(
      price / currency.conversionRate
    ).toLocaleString()}`;
  };
