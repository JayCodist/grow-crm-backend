import dayjs from "dayjs";
import express from "express";
import fetch from "node-fetch";
import { ApiError, InternalError } from "../../../core/ApiError";
import { SuccessResponse } from "../../../core/ApiResponse";
import {
  AppCurrency,
  AppCurrencyName
} from "../../../database/model/AppConfig";
import AppConfigRepo from "../../../database/repository/AppConfigRepo";
import UsersRepo from "../../../database/repository/UserRepo";
import { handleAuthValidation } from "../../../helpers/request-modifiers";
import { currencyOptions } from "../../../helpers/constants";

export const getCurrencies: (
  symbols?: string[]
) => Promise<Record<AppCurrencyName, number>> = async (
  symbols = ["USD", "GBP"]
) => {
  const response = await fetch(
    `https://api.apilayer.com/exchangerates_data/latest?symbols=${symbols.join(
      ","
    )}&base=NGN`,
    {
      headers: {
        apiKey: process.env.API_LAYER_KEY as string
      }
    }
  );
  const json = await response.json();
  if (response.ok) {
    return json.rates;
  }
  console.error("Unable to reach api-layer: ", json);
  throw new InternalError("Unexpected error occured");
};

const handshake = express.Router();

handshake.get("/", handleAuthValidation(true), async (req, res) => {
  try {
    const config = await AppConfigRepo.getConfig();
    let currencies: AppCurrency[] = config?.currencies || [];
    if (
      !config?.currenciesLastSyncDate ||
      dayjs(config.currenciesLastSyncDate).isBefore(
        dayjs().subtract(12, "hour")
      )
    ) {
      currencies = currencyOptions;
      await AppConfigRepo.updateConfig({
        ...config,
        currencies,
        currenciesLastSyncDate: dayjs().format()
      });
    }

    const user = req.user ? await UsersRepo.findByEmail(req.user.email) : null;

    return new SuccessResponse("success", { currencies, user }).send(res);
  } catch (err) {
    return ApiError.handle(err as Error, res);
  }
});

export default handshake;
