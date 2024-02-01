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
  | "highAbuja"
  | "mediumAbujaVals"
  | "mediumLagosVals"
  | "mediumAbujaFestive"
  | "mediumLagosFestive"
  | "highAbujaFestive"
  | "highLagosFestive"
  | "freeAbujaFestive"
  | "freeLagosFestive";

export const deliveryZoneAmount: Record<DeliveryZoneAmount, number> = {
  highLagos: 10000,
  freeLagos: 0,
  highLagosVals: 29900,
  freeLagosVals: 0,
  mediumLagos: 4500,
  mediumAbuja: 3500,
  freeAbuja: 0,
  highAbujaVals: 29900,
  freeAbujaVals: 0,
  highAbuja: 6000,
  mediumAbujaVals: 20000,
  mediumLagosVals: 20000,
  mediumAbujaFestive: 7000,
  mediumLagosFestive: 7000,
  highAbujaFestive: 15000,
  highLagosFestive: 15000,
  freeAbujaFestive: 0,
  freeLagosFestive: 0
};

export const defaultCurrency: AppCurrency = {
  name: "NGN",
  conversionRate: 1,
  sign: "₦"
};

export const currencyOptions: AppCurrency[] = [
  { ...defaultCurrency },
  { name: "USD", conversionRate: 895.303, sign: "$" },
  { name: "GBP", conversionRate: 1134.91, sign: "£" }
];

export const pickupLocations: Record<string, string> = {
  Lagos: `<span style="font-weight: 600">Lagos Pickup - </span>81b, Lafiaji Way, Dolphin Estate, Ikoyi, Lagos`,
  Abuja: `<span style="font-weight: 600">Abuja Pickup - </span>5, Nairobi Street, off Aminu Kano Crescent, Wuse 2, Abuja`
};

export type PaymentMethod =
  | "paystack"
  | "googlePay"
  | "payPal"
  | "monnify"
  | "manualTransfer"
  | "gtbTransfer"
  | "natwestTransfer"
  | "bitcoinTransfer";

export const paymentMethodMap: Record<PaymentMethod, string> = {
  paystack: "Paystack",
  googlePay: "Google Pay",
  payPal: "PayPal",
  monnify: "Monnify",
  manualTransfer: "Manual Transfer",
  gtbTransfer: "GTB Transfer",
  natwestTransfer: "Natwest Transfer",
  bitcoinTransfer: "Bitcoin Transfer"
};

export type DespatchLocation = "ikoyi" | "lekki" | "abuja";
export const despatchLocationMap: Record<DespatchLocation, string> = {
  ikoyi: "Ikoyi",
  abuja: "Abuja",
  lekki: "Lekki"
};
