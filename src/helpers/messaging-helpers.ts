import fetch, { Headers, RequestInit } from "node-fetch";
import { URLSearchParams } from "url";
import { InternalError } from "../core/ApiError";
import { Business } from "../database/model/Order";

// const mailjet = Mailjet.connect(
//   process.env.MAILJET_API_KEY as string,
//   process.env.MAILJET_SECRET_KEY as string
// );

export const sendEmailToAddress: (
  emailAddresses: string[],
  message: string,
  emailSubject: string,
  templateID?: string,
  business?: Business
) => Promise<void> = async (
  emailAddresses,
  message,
  emailSubject,
  templateID,
  business
) => {
  try {
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/x-www-form-urlencoded");

    const urlencoded = new URLSearchParams();
    urlencoded.append("address", emailAddresses.join(","));
    urlencoded.append("message", message);
    urlencoded.append("subject", emailSubject);
    urlencoded.append("templateID", templateID || "");
    urlencoded.append("business", business || "regalFlowers");

    const requestOptions: RequestInit = {
      method: "POST",
      headers: myHeaders,
      body: urlencoded,
      redirect: "follow"
    };

    const response = await fetch(
      "https://us-central1-regal-operations-defy.cloudfunctions.net/expressService/send-email",
      requestOptions
    );
    const json = await response.json();
    return json;
    // await mailjet.post("send", { version: "v3.1" }).request({
    //   Messages: [
    //     {
    //       From: {
    //         Email: "info@regalflowers.com.ng",
    //         Name: "Regal Flowers"
    //       },
    //       To: emailAddresses.map((addr, i) => ({
    //         Email: addr,
    //         Name: `user ${i + 1}`
    //       })),
    //       TemplateID: 1378967,
    //       TemplateLanguage: true,
    //       Subject: emailSubject,
    //       Variables: {
    //         body: message
    //       }
    //     }
    //   ]
    // });
  } catch (err) {
    throw new InternalError(
      (err as any).ErrorMessage || (err as Error).message
    );
  }
};
