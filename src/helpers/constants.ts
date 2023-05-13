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
