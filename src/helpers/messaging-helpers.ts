import fetch, { Headers, RequestInit } from "node-fetch";
import { URLSearchParams } from "url";
import { InternalError } from "../core/ApiError";
import { Business } from "../database/model/Order";
import { businessTemplateIdMap } from "../database/repository/utils";
import { signFirebaseToken } from "./formatters";

// const mailjet = Mailjet.connect(
//   process.env.MAILJET_API_KEY as string,
//   process.env.MAILJET_SECRET_KEY as string
// );

export const sendEmailToAddress: (
  emailAddresses: string[],
  message: string,
  emailSubject: string,
  business: Business
) => Promise<void> = async (
  emailAddresses,
  message,
  emailSubject,
  business
) => {
  try {
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/x-www-form-urlencoded");
    myHeaders.append("X-Secret-Key", signFirebaseToken());

    const urlencoded = new URLSearchParams();
    urlencoded.append("address", emailAddresses.join(","));
    urlencoded.append("message", message);
    urlencoded.append("subject", emailSubject);
    urlencoded.append(
      "templateID",
      businessTemplateIdMap[business as Business]
    );
    urlencoded.append("business", business || "regalFlowers");

    const requestOptions: RequestInit = {
      method: "POST",
      headers: myHeaders,
      body: urlencoded,
      redirect: "follow"
    };

    const response = await fetch(
      process.env.MESSAGING_URL as string,
      requestOptions
    );
    const json = await response.json();
    return json;
  } catch (err) {
    throw new InternalError(
      (err as any).ErrorMessage || (err as Error).message
    );
  }
};
