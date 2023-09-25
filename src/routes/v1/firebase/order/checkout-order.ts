import dayjs from "dayjs";
import express from "express";
import {
  ApiError,
  BadRequestError,
  NoDataError
} from "../../../../core/ApiError";
import { SuccessResponse } from "../../../../core/ApiResponse";
import {
  DeliveryLocationOption,
  Order
} from "../../../../database/model/Order";
import User, { Recipient, UserCreate } from "../../../../database/model/User";
import UsersRepo from "../../../../database/repository/UserRepo";
import firebaseAdmin from "../../../../helpers/firebase-admin";
import {
  formatPhoneNumber,
  getAdminNoteText
} from "../../../../helpers/formatters";
import {
  handleAuthValidation,
  handleFormDataParsing
} from "../../../../helpers/request-modifiers";
import validator from "../../../../helpers/validator";
import { handleContactHooks } from "./order-utils";
import validation from "./validation";
import {
  DeliveryZoneAmount,
  deliveryZoneAmount
} from "../../../../helpers/constants";
import { AppCurrencyName } from "../../../../database/model/AppConfig";

const { firestore } = firebaseAdmin;
const db = firestore();

const checkoutOrder = express.Router();

const resolveReminders = async (orderData: Order, orderID: string) => {
  const dayMonth = dayjs(orderData.deliveryDate, "YYYY-MM-DD")
    .subtract(7, "days")
    .format("DD-MM");
  let reminderType:
    | "birthdayReminder"
    | "anniversaryReminder"
    | "valentineReminder"
    | "christmasReminder"
    | "easterReminder"
    | null = null;
  const yearList: string[] = [];
  if (/birthday/i.test(orderData.purpose)) {
    reminderType = "birthdayReminder";
  } else if (/anniversary/i.test(orderData.purpose)) {
    reminderType = "anniversaryReminder";
  } else if (/valentine/i.test(orderData.purpose)) {
    reminderType = "valentineReminder";
  } else if (/christmas/i.test(orderData.purpose)) {
    reminderType = "christmasReminder";
  } else if (/easter/i.test(orderData.purpose)) {
    reminderType = "easterReminder";
  }
  if (reminderType) {
    await db.collection("reminders").add({
      orderID,
      type: reminderType,
      dayMonth,
      yearList
    });
  }
  return Boolean(reminderType);
};

checkoutOrder.put(
  "/:id",
  handleFormDataParsing(),
  validator(validation.checkoutOrder, "body"),
  handleAuthValidation(true),
  async (req, res) => {
    try {
      const {
        shouldCreateAccount,
        shouldSaveAddress,
        orderData,
        userData,
        deliveryLocation,
        currency
      } = req.body as {
        shouldCreateAccount: boolean;
        shouldSaveAddress: boolean;
        orderData: any;
        userData: UserCreate;
        deliveryLocation: DeliveryLocationOption | null;
        currency: AppCurrencyName;
      };

      const response = await Promise.all([
        firestore().collection("orders").doc(req.params.id).get(),
        firestore().collection("business").get()
      ]);

      const existingOrder = response[0].data() as Order | null;
      const business = response[1].docs.map(doc => doc.data());

      if (!existingOrder) {
        throw new NoDataError("Order not found");
      }

      const deliveryAmount =
        deliveryZoneAmount[
          orderData.deliveryDetails.zone.split("-")[0] as DeliveryZoneAmount
        ] || 0;

      const total =
        existingOrder.orderProducts.reduce(
          (acc, product) => acc + product.price * product.quantity,
          0
        ) + deliveryAmount;

      const adminNotes = getAdminNoteText(
        orderData.adminNotes,
        currency,
        total
      );

      let user: Omit<User, "password"> | null = req.user || null;

      if (shouldCreateAccount && !user) {
        if (!userData.email || !userData.password) {
          throw new BadRequestError(
            "You have to provide email and password to create new account"
          );
        }
        user = await UsersRepo.signup(userData);
      }
      if (shouldSaveAddress) {
        if (!user) {
          console.warn(
            `Cannot save address to empty user for order: ${orderData}`
          );
        } else {
          let { recipients } = user;
          if (!recipients) {
            recipients =
              (await UsersRepo.findByEmail(user.email))?.recipients || [];
          }

          const recipientPhone = formatPhoneNumber(
            orderData.recipient?.phone || ""
          );
          const existingRecipient = recipients.find(
            recipient => formatPhoneNumber(recipient.phone) === recipientPhone
          );

          recipients = existingRecipient
            ? recipients.map(recipient =>
                recipient === existingRecipient
                  ? {
                      ...recipient,
                      ...orderData.recipient,
                      message: orderData.deliveryMessage,
                      adminNotes,
                      despatchLocation: orderData.despatchLocation,
                      phoneAlt: formatPhoneNumber(
                        orderData.recipient?.phoneAlt ||
                          recipient.phoneAlt ||
                          ""
                      ),
                      deliveryLocation: deliveryLocation?.name,
                      phoneCountryCode: orderData.recipient?.phoneCountryCode,
                      altPhoneCountryCode:
                        orderData.recipient.altPhoneCountryCode
                    }
                  : recipient
              )
            : [
                ...recipients,
                {
                  ...(orderData.recipient as Recipient),
                  message: orderData.deliveryMessage,
                  despatchLocation: orderData.despatchLocation,
                  adminNotes,
                  phone: formatPhoneNumber(orderData.recipient?.phone || ""),
                  phoneAlt: formatPhoneNumber(
                    orderData.recipient?.phoneAlt || ""
                  ),
                  deliveryLocation: deliveryLocation?.name,
                  phoneCountryCode: orderData.recipient?.phoneCountryCode,
                  altPhoneCountryCode: orderData.recipient.altPhoneCountryCode
                }
              ];
          await UsersRepo.update({ id: user.id, recipients });
        }
      }

      const shouldUpdateUser =
        user?.name !== userData.name ||
        user?.phone !== formatPhoneNumber(userData.phone);

      if (user && shouldUpdateUser) {
        await UsersRepo.update({
          id: user.id,
          phone: formatPhoneNumber(userData.phone || ""),
          phoneAlt: formatPhoneNumber(userData.phoneAlt || ""),
          phoneCountryCode: userData.phoneCountryCode,
          name: userData.name
        });
      }

      const client = await handleContactHooks(userData, "client");
      const recipient = await handleContactHooks(
        orderData.recipient.method === "delivery"
          ? orderData.recipient
          : {
              name: `Pickup ${orderData.despatchLocation}`,
              phone: `Pickup${orderData.despatchLocation}`
            },
        "recipient"
      );

      const recipientAddress = `(${orderData.recipient.residenceType || ""}) ${
        orderData.recipient.address
      }`;

      const sendReminders = orderData.purpose
        ? await resolveReminders(
            {
              ...existingOrder,
              ...orderData
            },
            req.params.id
          )
        : false;

      const businessLetter = business.find(
        bus => bus.name === existingOrder?.business
      )?.letter;

      await db
        .collection("orders")
        .doc(req.params.id)
        .update({
          ...orderData,
          client,
          recipient,
          purpose: orderData.purpose || "Unknown",
          recipientAddress,
          sendReminders,
          isClientRecipient: orderData.recipient.method === "pick-up",
          orderDetails: deliveryLocation
            ? `${(
                existingOrder.orderDetails
                  .split("=")[0]
                  .split("+")
                  .filter(part => !part.includes("delivery"))
                  .join("+") || ""
              ).trim()} + delivery(${deliveryAmount}) = ${total}`
            : existingOrder.orderDetails,
          amount: total,
          orderStatus: "processing",
          adminNotes,
          currency,
          deliveryAmount,
          fullOrderId: `${businessLetter}${existingOrder?.deliveryZone}${existingOrder.orderID}W`
        } as Partial<Order>);

      return new SuccessResponse("Order successfully checked out", null).send(
        res
      );
    } catch (error) {
      return ApiError.handle(error as Error, res);
    }
  }
);

export default checkoutOrder;
