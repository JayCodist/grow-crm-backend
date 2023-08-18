import { AppCurrency } from "../database/model/AppConfig";

export const createdAtDateFormat = "dddd, D MMM YYYY hh:mm:ss A";

export type DeliveryZoneAmount =
  | "highLagos"
  | "freeLagos"
  | "highLagosVals"
  | "freeLagosVals"
  | "mediumLagos"
  | "mediumAbuja"
  | "freeAbuja"
  | "highAbujaVals"
  | "freeAbujaVals"
  | "highAbuja";

export const deliveryZoneAmount: Record<DeliveryZoneAmount, number> = {
  highLagos: 10000,
  freeLagos: 0,
  highLagosVals: 15000,
  freeLagosVals: 0,
  mediumLagos: 4500,
  mediumAbuja: 3500,
  freeAbuja: 0,
  highAbujaVals: 15000,
  freeAbujaVals: 0,
  highAbuja: 6000
};

export const defaultCurrency: AppCurrency = {
  name: "NGN",
  conversionRate: 1,
  sign: "₦"
};

export const currencyOptions: AppCurrency[] = [
  { ...defaultCurrency },
  { name: "USD", conversionRate: 700, sign: "$" },
  { name: "GBP", conversionRate: 890, sign: "£" }
];

export const pickupLocations: Record<string, string> = {
  Lagos: `<span style="font-weight: 600">Lagos Pickup - </span>81b, Lafiaji Way, Dolphin Estate, Ikoyi, Lagos`,
  Abuja: `<span style="font-weight: 600">Abuja Pickup - </span>5, Nairobi Street, off Aminu Kano Crescent, Wuse 2, Abuja`
};
