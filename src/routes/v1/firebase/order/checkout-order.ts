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
import { formatPhoneNumber } from "../../../../helpers/formatters";
import {
  handleAuthValidation,
  handleFormDataParsing
} from "../../../../helpers/request-modifiers";
import validator from "../../../../helpers/validator";
import validation from "./validation";

const checkoutOrder = express.Router();

checkoutOrder.put(
  "/:id",
  handleFormDataParsing(),
  validator(validation.checkoutOrder, "body"),
  handleAuthValidation(true),
  async (req, res) => {
    try {
      const { firestore } = firebaseAdmin;
      const {
        shouldCreateAccount,
        shouldSaveAddress,
        orderData,
        userData,
        deliveryLocation
      } = req.body as {
        shouldCreateAccount: boolean;
        shouldSaveAddress: boolean;
        orderData: any;
        userData: UserCreate;
        deliveryLocation: DeliveryLocationOption | null;
      };

      const existingOrder = (
        await firestore().collection("orders").doc(req.params.id).get()
      ).data() as Order | null;

      if (!existingOrder) {
        throw new NoDataError("Order not found");
      }

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
                      adminNotes: orderData.adminNotes,
                      despatchLocation: orderData.despatchLocation,
                      phoneAlt: formatPhoneNumber(
                        orderData.recipient?.phoneAlt ||
                          recipient.phoneAlt ||
                          ""
                      ),
                      deliveryLocation: deliveryLocation?.name
                    }
                  : recipient
              )
            : [
                ...recipients,
                {
                  ...(orderData.recipient as Recipient),
                  message: orderData.deliveryMessage,
                  despatchLocation: orderData.despatchLocation,
                  adminNotes: orderData.adminNotes,
                  phone: formatPhoneNumber(orderData.recipient?.phone || ""),
                  phoneAlt: formatPhoneNumber(
                    orderData.recipient?.phoneAlt || ""
                  ),
                  deliveryLocation: deliveryLocation?.name
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

      await firestore()
        .collection("orders")
        .doc(req.params.id)
        .update({
          ...orderData,
          orderDetails: deliveryLocation
            ? `${(
                existingOrder.orderDetails.split("=")[0] || ""
              ).trim()} + delivery(${deliveryLocation.amount}) = ${
                existingOrder.amount + (deliveryLocation?.amount || 0)
              }`
            : existingOrder.orderDetails,
          amount: existingOrder.amount + (deliveryLocation?.amount || 0),
          recipient: {
            ...orderData.recipient,
            address: [orderData.recipient?.address || ""].filter(Boolean)
          }
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
