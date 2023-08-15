import express from "express";
import {
  handleFormDataParsing,
  handleAuthValidation
} from "../../../../helpers/request-modifiers";
import validator from "../../../../helpers/validator";
import validation from "./validation";
import { Order } from "../../../../database/model/Order";
import {
  ApiError,
  BadRequestError,
  NoDataError
} from "../../../../core/ApiError";
import { SuccessResponse } from "../../../../core/ApiResponse";
import firebaseAdmin from "../../../../helpers/firebase-admin";
import ProductWPRepo from "../../../../database/repository/ProductWPRepo";
import {
  OrderItemImage,
  deduceProductTruePrice,
  getFBProductDisplayName,
  getFirebaseProducts,
  getWpProducts
} from "./create";
import { AppCurrencyName } from "../../../../database/model/AppConfig";
import { getAdminNoteText } from "../../../../helpers/formatters";
import {
  DeliveryZoneAmount,
  deliveryZoneAmount
} from "../../../../helpers/constants";

export const updateOrder = express.Router();

const { firestore } = firebaseAdmin;
const db = firestore().collection("orders");

updateOrder.put(
  "/:id",
  handleFormDataParsing(),
  validator(validation.updateOrder, "body"),
  handleAuthValidation(true),
  async (req, res) => {
    try {
      const { cartItems, deliveryDate, currency } = req.body as {
        cartItems: {
          key: number;
          design?: string;
          size?: string;
          quantity: number;
          image: OrderItemImage;
        }[];
        deliveryDate: string;
        currency: AppCurrencyName;
      };

      const existingOrder = (
        await firestore().collection("orders").doc(req.params.id).get()
      ).data() as Order | null;

      if (!existingOrder) {
        throw new NoDataError("Order not found");
      }

      const _wpProducts = await ProductWPRepo.findByKeys(
        cartItems.map(item => item.key)
      );
      const wpProducts = getWpProducts(cartItems, _wpProducts);

      if (wpProducts.length !== cartItems.length) {
        throw new BadRequestError("Some products not found");
      }

      const deliveryAmount =
        deliveryZoneAmount[
          existingOrder.deliveryDetails.zone.split("-")[0] as DeliveryZoneAmount
        ] || 0;

      const totalPrice =
        wpProducts.reduce((price, product, index) => {
          const cartItem = cartItems[index];
          const productPrice = deduceProductTruePrice(product, cartItem);
          return price + productPrice * cartItem.quantity;
        }, 0) + deliveryAmount;

      const fbProducts = await getFirebaseProducts(
        wpProducts.map(prod => prod.sku).filter(Boolean)
      );

      const orderProducts = fbProducts.map(prod => {
        const prodIndex = wpProducts.findIndex(_prod => _prod.sku === prod.SKU);
        const { quantity, size, design, image } = cartItems[prodIndex];
        return {
          name: prod.name,
          SKU: prod.SKU,
          size,
          design,
          quantity,
          image,
          price: deduceProductTruePrice(
            wpProducts[prodIndex],
            cartItems[prodIndex]
          ),
          key: wpProducts[prodIndex].key
        };
      });

      let orderDetails = orderProducts
        .map(product => {
          const wpProductIndex = wpProducts.findIndex(
            _prod => _prod.sku === product.SKU
          );
          const price =
            wpProductIndex >= 0
              ? deduceProductTruePrice(
                  wpProducts[wpProductIndex],
                  cartItems[wpProductIndex]
                )
              : 0;
          return `${
            product.quantity > 1 ? `${String(product.quantity)} TIMES ` : ""
          } ${getFBProductDisplayName(product)} (${price * product.quantity})`;
        })
        .join(" + ");
      orderDetails += ` = ${totalPrice}`;

      let { adminNotes } = existingOrder;
      adminNotes = getAdminNoteText(adminNotes, currency, totalPrice);

      await db.doc(req.params.id).update({
        amount: totalPrice,
        orderProducts,
        orderDetails,
        deliveryDate,
        adminNotes,
        currency
      });

      const response = await db.doc(req.params.id).get();

      return new SuccessResponse("sucess", {
        ...response.data(),
        id: response.id
      }).send(res);
    } catch (error) {
      return ApiError.handle(error as Error, res);
    }
  }
);
