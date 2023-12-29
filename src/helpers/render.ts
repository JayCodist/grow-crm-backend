import fs from "fs";
import { AppCurrency } from "../database/model/AppConfig";
import { Business, Order } from "../database/model/Order";
import { currencyOptions, pickupLocations } from "./constants";

export const getPriceDisplay: (price: number, currency: AppCurrency) => string =
  (price, currency) => {
    return `${currency.sign || ""}${Math.ceil(
      price / currency.conversionRate
    ).toLocaleString()}`;
  };

const businessColor: Record<Business, string> = {
  floralHub: "#b240d",
  regalFlowers: "#ba0b4f"
};

export const templateRender = (
  order: Order,
  path: string,
  business: Business
): string => {
  const file = fs;
  const template = file.readFileSync(`./src/templates/${path}.html`, "utf-8");
  const subtotal = order.deliveryAmount
    ? order.amount - order.deliveryAmount
    : order.amount;
  const addtionalInfo = order.adminNotes.replace(
    /([£$]\d+(?:[.,]\d{2})?)/gu,
    ""
  );
  const displayOptionalMessage =
    addtionalInfo || order.purpose || order.deliveryMessage;

  const currency = currencyOptions.find(
    currency => currency.name === order.currency
  ) as AppCurrency;

  const filledTemplate = template
    .replace("{{name}}", order.client.name as string)
    .replace("{{orderID}}", `${order.fullOrderId}`)
    .replace("{{deliveryDate}}", order.deliveryDate as string)
    .replace(
      "{{orderProducts}}",
      order.orderProducts
        .map(
          product => `<tr style="font-size: 0.9rem; border: 0.1rem solid #e4e4e4"">
                <td style="border: 0.1rem solid #e4e4e4; padding: 0.8rem"">${
                  product.name
                }</td>
                <td style="border: 0.1rem solid #e4e4e4; padding: 0.8rem"">${
                  product.quantity
                }</td>
                <td style="border: 0.1rem solid #e4e4e4; padding: 0.8rem">${getPriceDisplay(
                  product.price,
                  currency
                )}</td>
              </tr>`
        )
        .join("")
    )
    .replace("{{subtotal}}", `${getPriceDisplay(subtotal, currency)}`)
    .replace("{{total}}", `${getPriceDisplay(order.amount, currency)}`)
    .replace("{{paymentDetails}}", `${order.paymentDetails}`)
    .replace(
      "{{deliveryCharge}}",
      order.deliveryAmount
        ? `<p style="margin: 0.5rem 0; color: #737373;"><span style="font-weight: 600;">Delivery Charge:</span> ${getPriceDisplay(
            order.deliveryAmount,
            currency
          )}</p>`
        : ""
    )
    .replace(
      "{{optionalMessage}}",
      displayOptionalMessage
        ? `<p style="color: ${businessColor[business]}; font-weight: 600; font-size: 1.2rem; margin: 0.5rem 0;">Optional Message</p>`
        : ""
    )
    .replace(
      "{{addtionalInfo}}",
      addtionalInfo
        ? `<p style="margin: 0.5rem 0; color: #737373;"><span style="font-weight: 600">Additional Info:</span> ${addtionalInfo}</p>`
        : ""
    )
    .replace(
      "{{deliveryMessage}}",
      order.deliveryMessage
        ? `<p style="margin: 0.5rem 0; color: #737373;"><span style="font-weight: 600">Message:</span> ${order.deliveryMessage}</p>`
        : ""
    )
    .replace(
      "{{purpose}}",
      order.purpose
        ? `<p style="margin: 0.5rem 0; color: #737373;"><span style="font-weight: 600">Purpose:</span> ${order.purpose}</p>`
        : ""
    )
    .replace("{{senderName}}", order.client.name as string)
    .replace("{{senderPhone}}", order.client.phone as string)
    .replace("{{senderEmail}}", order.client.email as string)
    .replace("{{deliveryDate}}", order.deliveryDate as string)
    .replace(
      "{{pickUp}}",
      order.isClientRecipient
        ? `<p style="color: ${
            businessColor[business]
          }; font-weight: 600; font-size: 1.2rem; margin: 0.5rem 0; style="color: ${
            businessColor[business]
          }">Pick Up Location</p>
              <p style="margin: 0.5rem 0; color: #737373;">
              ${pickupLocations[order.despatchLocation as string]}
              </p>
              `
        : ""
    )
    .replace(
      "{{recipient}}",
      !order.isClientRecipient
        ? `
              <p style="color: ${businessColor[business]}; font-weight: 600; font-size: 1.2rem; margin: 0.5rem 0">Receiver's Information</p>
            <p style="margin: 0.5rem 0; color: #737373;">
              <span style="font-weight: 600">Name:</span>
              ${order.deliveryDetails.recipientName}
            </p>
            <p style="margin: 0.5rem 0; color: #737373;">
              <span style="font-weight: 600"
                >Residence Type:</span
              >
              ${order.deliveryDetails.recidenceType}
            </p>
            <p style="margin: 0.5rem 0; color: #737373;">
              <span style="font-weight: 600">Address:</span>
              ${order.deliveryDetails.recipientAddress}
            </p>
            
            <p style="margin: 0.5rem 0; color: #737373;">
              <span style="font-weight: 600">Phone Number:</span>
              ${order.deliveryDetails.recipientPhone}
            </p>
            <p style="margin: 0.5rem 0; color: #737373;">
              <span style="font-weight: 600"
                >Alternative Phone Number:</span
              >
              ${order.deliveryDetails.recipientAltPhone}
            </p>
            <p style="margin: 0.5rem 0; color: #737373;">
              <span style="font-weight: 600">Delivery Instruction:</span>
              ${order.deliveryInstruction}
            </p>
          `
        : ""
    );

  return filledTemplate;
};

export const clientMessageTemplateRender = (payload: {
  name: string;
  email: string;
  message: string;
}): string => {
  const file = fs;
  const template = file.readFileSync(
    `./src/templates/client-message.html`,
    "utf-8"
  );

  const filledTemplate = template
    .replace("{{name}}", payload.name)
    .replace("{{email}}", payload.email)
    .replace("{{message}}", payload.message);

  return filledTemplate;
};
