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

const getCurrencies: () => Promise<Record<AppCurrencyName, number>> =
  async () => {
    const response = await fetch(
      "https://api.apilayer.com/exchangerates_data/latest?symbols=USD,GBP&base=NGN",
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
      const rates = await getCurrencies();
      currencies = Object.keys(rates).map(currencyName => ({
        name: currencyName as AppCurrencyName,
        conversionRate: Math.round(1 / rates[currencyName as AppCurrencyName])
      }));
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
