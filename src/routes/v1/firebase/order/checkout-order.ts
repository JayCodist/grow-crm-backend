import express from "express";
import { ApiError, BadRequestError } from "../../../../core/ApiError";
import {
  NotFoundResponse,
  SuccessResponse
} from "../../../../core/ApiResponse";
import User, { Recipient, UserCreate } from "../../../../database/model/User";
import UsersRepo from "../../../../database/repository/UserRepo";
import firebaseAdmin from "../../../../helpers/firebase-admin";
import { formatPhoneNumber } from "../../../../helpers/formatters";
import {
  handleAuthValidation,
  handleFormDataParsing
} from "../../../../helpers/request-modifiers";
import validator from "../../../../helpers/validator";
import validation from "./validation";

interface OrderItem {
  SKU?: string;
  name: string;
  quantity: number;
}

type PaymentStatus =
  | "PAID - GO AHEAD (but not seen yet)"
  | "Not Paid (finalized discussion)"
  | "PAID - GO AHEAD (Bank Transfer)"
  | "PART- PAYMENT PAID - GO AHEAD (but not seen yet)"
  | "PAID - GO AHEAD (Paypal)"
  | "Not Paid (still discussing)"
  | "PAID - GO AHEAD (cash - Ikoyi)"
  | "PAID - GO AHEAD (cash - VI)"
  | "PAID - GO AHEAD (cash - ABUJA)"
  | "PAID - GO AHEAD (POS - Ikoyi)"
  | "PAID - GO AHEAD (POS - VI)"
  | "PAID - GO AHEAD (POS - ABUJA)"
  | "NOT PAID - BUT GO AHEAD"
  | "PAID - GO AHEAD (Website - Card)"
  | "Not Paid (cancelled)"
  | "Not Paid (Website - Bank Transfer)"
  | "PART PAYMENT RECEIVED (GO AHEAD)"
  | "Not Paid (Website - card)"
  | "PAID - GO AHEAD (Transferwise)"
  | "PAID - GO AHEAD (UK Bank Transfer)"
  | "PAID - GO AHEAD (cash - on delivery)"
  | "GO AHEAD (Bad Flowers)"
  | "Not Paid (Website - Paypal)"
  | "PAID - GO AHEAD (Western Union)"
  | "PAID - GO AHEAD (POS - Lekki)"
  | "PAID - GO AHEAD (WorldRemit)"
  | "Refunded"
  | "PAID - GO AHEAD (Bitcoins)"
  | "PAID - GO AHEAD (cash - Lekki)"
  | "PAID - GO AHEAD (Payoneer)"
  | "PAID - GO AHEAD (CashApp and other alternatives)"
  | "PAID - GO AHEAD (POS - on delivery)";

type Channel =
  | "Phone"
  | "Whatsapp"
  | "Instagram"
  | "Walk-in Ikeja Airport"
  | "Walk-in Ikoyi"
  | "Walk-in VI"
  | "Walk-in Abuja"
  | "3rd Party - Jumia"
  | "3rd Party - SureGifts"
  | "Regal Website"
  | "FloralHub Website"
  | "3rd Party - SME Markethub"
  | "Walk-in Lekki"
  | "3rd Party - Arab Flowers Network"
  | "Email"
  | "Facebook"
  | "Other";

type DeliveryStatus =
  | "Not Arranged"
  | "Arranged"
  | "Arranged and Sorted"
  | "Arranged and Inspected"
  | "Despatched (given to driver/trip not started)"
  | "Despatched"
  | "Despatched and Client Notified"
  | "Delivered"
  | "Delivered and Client Notified"
  | "Delivery Failed/Issues with Delivery"
  | "Despatched (drivers update)"
  | "Delivered (drivers update)";

export interface OrderActor {
  id?: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  address?: string[];
  phone?: string;
  phoneAlt?: string;
  phoneAlt2?: string;
  email?: string;
  residenceType?: string;
  state?: string;
  method?: string;
}

export interface Order {
  orderProducts?: OrderItem[];
  paymentStatus?: PaymentStatus;
  orderID?: number;
  deliveryStatus?: DeliveryStatus;
  fullOrderId?: string;
  id: string;
  amount: number;
  deliveryDate: string;
  channel: Channel;
  recipient: OrderActor;
  client: OrderActor;
  driver: OrderActor;
}

const checkoutOrder = express.Router();

checkoutOrder.put(
  "/:id",
  handleFormDataParsing(),
  validator(validation.checkoutOrder, "body"),
  handleAuthValidation(true),
  async (req, res) => {
    try {
      const { firestore } = firebaseAdmin;
      const { shouldCreateAccount, shouldSaveAddress, orderData, userData } =
        req.body as {
          shouldCreateAccount: boolean;
          shouldSaveAddress: boolean;
          orderData: any;
          userData: UserCreate;
        };
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
            recipient => recipient.phone === recipientPhone
          );
          recipients = existingRecipient
            ? recipients.map(recipient =>
                recipient === existingRecipient
                  ? {
                      ...recipient,
                      ...orderData.recipient,
                      message: orderData.deliveryMessage,
                      despatchLocation: orderData.despatchLocation,
                      phoneAlt: formatPhoneNumber(
                        orderData.recipient?.phoneAlt ||
                          recipient.phoneAlt ||
                          ""
                      )
                    }
                  : recipient
              )
            : [
                ...recipients,
                {
                  ...(orderData.recipient as Recipient),
                  message: orderData.deliveryMessage,
                  despatchLocation: orderData.despatchLocation,
                  phone: formatPhoneNumber(orderData.recipient?.phone || ""),
                  phoneAlt: formatPhoneNumber(
                    orderData.recipient?.phoneAlt || ""
                  )
                }
              ];
          await UsersRepo.update({ id: user.id, recipients });
        }
      } else if (user) {
        await UsersRepo.update({
          id: user.id,
          email: userData.email,
          phone: formatPhoneNumber(userData.phone || ""),
          phoneAlt: formatPhoneNumber(userData.phoneAlt || "")
        });
      }

      // TODO: update firebase contact for recipient and client after updating order

      const response = await firestore()
        .collection("orders")
        .doc(req.params.id)
        .update({
          ...orderData,
          recipient: {
            ...orderData.recipient,
            address: [orderData.recipient?.address || ""].filter(Boolean)
          }
        });

      if (!response) {
        return new NotFoundResponse("Order could not be updated").send(res);
      }

      const updatedOrder = await firestore()
        .collection("orders")
        .doc(req.params.id)
        .get();

      const updatedOrderResponse = {
        ...updatedOrder.data(),
        id: req.params.id
      };

      return new SuccessResponse("success", updatedOrderResponse).send(res);
    } catch (error) {
      return ApiError.handle(error as Error, res);
    }
  }
);

export default checkoutOrder;
