import express from "express";
import {
  ApiError,
  BadRequestError,
  NoDataError
} from "../../../../core/ApiError";
import { SuccessResponse } from "../../../../core/ApiResponse";
import {
  Business,
  OrderCreate,
  businessTitleMap,
  channelBusinessMap
} from "../../../../database/model/Order";
import ProductWPRepo from "../../../../database/repository/ProductWPRepo";
import firebaseAdmin from "../../../../helpers/firebase-admin";
import { handleFormDataParsing } from "../../../../helpers/request-modifiers";
import { handleContactHooks } from "./utils";
import { AppCurrencyName } from "../../../../database/model/AppConfig";
import { currencyOptions } from "../../../../helpers/constants";
import {
  ProductWP,
  allDesignOptions
} from "../../../../database/model/product-wp/model.interface";
import validation from "./validation";
import validator from "../../../../helpers/validator";
import { getPriceDisplay } from "../../../../helpers/render";
import { addRecentOrderChange } from "../../../../helpers/type-conversion";

const createOrder = express.Router();
const { firestore } = firebaseAdmin;
const db = firestore().collection("orders");

export const getFBProductDisplayName = (product: any) =>
  product.displayNameAdmin ||
  product.name.split("-").slice(1).join("-").trim() ||
  product.name;

export const deduceProductTruePrice = (
  product: ProductWP,
  cartItem: { key: number; design?: string; size?: string; quantity: number }
) => {
  const subTotal = product.variants.length
    ? product.variants.find(variant => variant.name === cartItem.size)?.price ||
      0
    : product.price;
  if (subTotal === 0) {
    throw new BadRequestError(
      `Invalid product or product size selected ${product.name}`
    );
  }

  const designPrice = cartItem.design
    ? allDesignOptions.find(design => design.name === cartItem.design)?.price ||
      0
    : 0;
  return subTotal + designPrice;
};

export const getFirebaseProducts: (skus: string[]) => Promise<any[]> =
  async skus => {
    const chunks = [];
    const chunkSize = 10;
    for (let i = 0, len = skus.length; i < len; i += chunkSize) {
      chunks.push(skus.slice(i, i + chunkSize));
    }
    const responses = await Promise.all(
      chunks.map(chunk =>
        firestore().collection("products").where("SKU", "in", chunk).get()
      )
    );
    return responses
      .map(snap => snap.docs)
      .flat()
      .map(doc => ({ id: doc.id, ...doc.data() }));
  };

export interface OrderItemImage {
  alt: string;
  src: string;
}
export interface CartItem {
  key: number;
  design?: string;
  size?: string;
  quantity: number;
  image: OrderItemImage;
}

export const getWpProducts: (
  cartItems: CartItem[],
  wpProducts: ProductWP[]
) => ProductWP[] = (cartItems, wpProducts) => {
  const _wpProducts = cartItems
    .map(item => wpProducts.find(prod => prod.key === item.key))
    .map((prod, i) =>
      prod
        ? {
            ...prod,
            sku: prod.variants.length
              ? prod.variants.find(
                  variant => variant.name === cartItems[i].size
                )?.sku || ""
              : prod.sku
          }
        : null
    )
    .filter(Boolean) as ProductWP[];

  return _wpProducts;
};

createOrder.post(
  "/create",
  handleFormDataParsing(),
  validator(validation.createOrder, "body"),
  async (req, res) => {
    try {
      const { user } = req;
      const client = user?.phone
        ? await handleContactHooks(user, "client")
        : {};

      const { cartItems, deliveryDate, currency, business } = req.body as {
        cartItems: CartItem[];
        deliveryDate: string;
        currency: AppCurrencyName;
        business: Business;
      };
      const _wpProducts = await ProductWPRepo.findByKeys(
        cartItems.map(item => item.key),
        business
      );
      const wpProducts = getWpProducts(cartItems, _wpProducts);

      if (wpProducts.length !== cartItems.length) {
        const missingProduct = cartItems.filter(
          item => !wpProducts.some(prod => prod.key === item.key)
        );
        throw new BadRequestError(`Some products not found ${missingProduct}`);
      }

      const totalPrice = wpProducts.reduce((price, product, index) => {
        const cartItem = cartItems[index];
        const productPrice = deduceProductTruePrice(product, cartItem);
        return price + productPrice * cartItem.quantity;
      }, 0);

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
          key: wpProducts[prodIndex].key,
          price: deduceProductTruePrice(
            wpProducts[prodIndex],
            cartItems[prodIndex]
          )
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

      const _currency =
        currencyOptions.find(_currency => _currency.name === currency) || "";

      const payload: OrderCreate = {
        amount: totalPrice,
        orderProducts,
        orderDetails,
        client,
        paymentStatus: "Website Not Paid (finalized discussion)",
        cost: 0,
        deliveryDate: deliveryDate || "",
        admin: "regalflowersnigeria@gmail.com",
        adminNotes: `${
          _currency && _currency.name !== "NGN"
            ? getPriceDisplay(totalPrice, _currency)
            : ""
        }`,
        currency: currency || "NGN",
        anonymousClient: false,
        arrangementTime: "",
        business: businessTitleMap[business],
        channel: channelBusinessMap[business],
        contactDepsArray: [client.id].filter(Boolean) as string[],
        costBreakdown: "",
        deliveryMessage: "",
        deliveryNotePrinted: false,
        deliveryStatus: "Not Arranged",
        deliveryZone: "WEB",
        despatchFrom: "Unselected",
        driver: {},
        editingAdminsRevised: [],
        feedback: {},
        isClientRecipient: false,
        isDuplicatedOrder: false,
        lastDeliveryNotePrintedAdmin: "",
        lastDeliveryNotePrintedTime: "",
        lastDeliveryStatusAdmin: "",
        lastDeliveryStatusTime: "",
        lastMessagePrintedAdmin: "",
        lastMessagePrintedTime: "",
        lastPaymentStatusAdmin: "",
        lastPaymentStatusTime: "",
        line: "NA",
        messagePrinted: false,
        profit: 0,
        purpose: "Unknown",
        recipient: {},
        recipientAddress: "",
        receivedByName: "",
        receivedByPhone: "",
        sendReminders: false,
        upsellProfit: 0,
        websiteOrderID: "",
        driverAlerted: false,
        orderStatus: "created",
        deliveryDetails: {
          recidenceType: "",
          recipientAddress: "",
          recipientName: "",
          recipientPhone: "",
          recipientAltPhone: "",
          state: "",
          zone: ""
        },
        deliveryAmount: 0,
        orderID: 0,
        deliveryInstruction: "",
        fullOrderId: "",
        paymentMethod: null,
        paymentDetails: ""
      };

      const response = await db.add({
        ...payload,
        timestamp: firestore.FieldValue.serverTimestamp()
      });

      await addRecentOrderChange(response.id, null, "add");

      if (!response) {
        throw new NoDataError("Order not created");
      }

      const createdOrder = await db.doc(response.id).get();

      const createdOrderResponse = { ...createdOrder.data(), id: response.id };

      return new SuccessResponse("success", {
        ...createdOrderResponse
      }).send(res);
    } catch (error) {
      return ApiError.handle(error as Error, res);
    }
  }
);

export default createOrder;
