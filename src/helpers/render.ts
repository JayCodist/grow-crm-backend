import fs from "fs";
import { AppCurrency } from "../database/model/AppConfig";
import { Order } from "../database/model/Order";
import { currencyOptions, pickupLocations } from "./constants";
import { getPriceDisplay } from "./type-conversion";

export const templateRender = (order: Order, adminNotes: string): string => {
  const file = fs;
  const template = file.readFileSync("./src/templates/sample.html", "utf-8");
  const subtotal = order.deliveryAmount
    ? order.amount - order.deliveryAmount
    : order.amount;
  const displayOptionalMessage =
    order.adminNotes || order.purpose || order.deliveryMessage;

  const currency = currencyOptions.find(
    currency => currency.name === order.currency
  ) as AppCurrency;

  const filledTemplate = template
    .replace("{{name}}", order.client.name as string)
    .replace("{{orderID}}", `${order.orderID}`)
    .replace("{{deliveryDate}}", order.deliveryDate as string)
    .replace(
      "{{orderProducts}}",
      order.orderProducts
        .map(
          product => `<tr style="font-size: 0.8rem">
                <td style="width: 50%">${product.name}</td>
                <td style="width: 10%">${product.quantity}</td>
                <td>₦${getPriceDisplay(product.price, currency)}</td>
              </tr>`
        )
        .join("")
    )
    .replace("{{subtotal}}", `${getPriceDisplay(subtotal, currency)}`)
    .replace("{{total}}", `${getPriceDisplay(order.amount, currency)}`)
    .replace(
      "{{deliveryCharge}}",
      order.deliveryAmount
        ? `<p style="margin-bottom: 1rem;"><span style="font-weight: 600">Delivery Charge:</span> ${getPriceDisplay(
            order.deliveryAmount,
            currency
          )}</p>`
        : ""
    )
    .replace(
      "{{optionalMessage}}",
      displayOptionalMessage
        ? `<p style="color: #ba0b4f; font-weight: 600; font-size: 1.2rem; margin: 1rem 0;">Optional Message</p>`
        : ""
    )
    .replace(
      "{{adminNotes}}",
      adminNotes
        ? `<p style="margin-bottom: 1rem;"><span style="font-weight: 600">Additional Info:</span> ${adminNotes}</p>`
        : ""
    )
    .replace(
      "{{deliveryMessage}}",
      order.deliveryMessage
        ? `<p style="margin-bottom: 1rem;"><span style="font-weight: 600">Message:</span> ${order.deliveryMessage}</p>`
        : ""
    )
    .replace(
      "{{purpose}}",
      order.purpose
        ? `<p style="margin-bottom: 1rem;"><span style="font-weight: 600">Purpose:</span> ${order.purpose}</p>`
        : ""
    )
    .replace("{{senderName}}", order.client.name as string)
    .replace("{{senderPhone}}", order.client.phone as string)
    .replace("{{senderEmail}}", order.client.email as string)
    .replace("{{deliveryDate}}", order.deliveryDate as string)
    .replace(
      "{{pickUp}}",
      order.isClientRecipient
        ? `<p style="color: #ba0b4f; font-weight: 600; font-size: 1.2rem; margin: 1rem 0;">Pick Up Location</p>
              <p style="margin-bottom: 1rem;">
              ${pickupLocations[order.despatchLocation as string]}
              </p>
              `
        : ""
    )
    .replace(
      "{{recipient}}",
      !order.isClientRecipient
        ? `
              <p style="color: #ba0b4f; font-weight: 600; font-size: 1.2rem; margin: 1rem 0;">Receiver's Information</p>
            <p style="margin-bottom: 1rem;">
              <span style="font-weight: 600">Name:</span>
              ${order.deliveryDetails.recipientName}
            </p>
            <p style="margin-bottom: 1rem;">
              <span style="font-weight: 600"
                >Residence Type:</span
              >
              ${order.deliveryDetails.recidenceType}
            </p>
            <p style="margin-bottom: 1rem;">
              <span style="font-weight: 600">Address:</span>
              ${order.deliveryDetails.recipientAddress}
            </p>
            
            <p style="margin-bottom: 1rem;">
              <span style="font-weight: 600">Phone Number:</span>
              ${order.deliveryDetails.recipientPhone}
            </p>
            <p style="margin-bottom: 1rem;">
              <span style="font-weight: 600"
                >Alternative Phone Number:</span
              >
              ${order.deliveryDetails.recipientAltPhone}
            </p>
            <p style="margin-bottom: 1rem;">
              <span style="font-weight: 600">Delivery Instruction:</span>
              ${order.deliveryInstruction}
            </p>
          `
        : ""
    );

  fs.writeFileSync(`./src/templates/sample.html`, filledTemplate);
  return filledTemplate;
};
