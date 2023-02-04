import express from "express";
import {
  ApiError,
  BadRequestError,
  NoDataError
} from "../../../../core/ApiError";
import { SuccessResponse } from "../../../../core/ApiResponse";
import { OrderCreate } from "../../../../database/model/Order";
import { ProductWP } from "../../../../database/model/ProductWP";
import ProductWPRepo from "../../../../database/repository/ProductWPRepo";
import firebaseAdmin from "../../../../helpers/firebase-admin";
import { handleFormDataParsing } from "../../../../helpers/request-modifiers";
import { handleContactHooks } from "./order-utils";

const createOrder = express.Router();
const { firestore } = firebaseAdmin;
const db = firestore().collection("orders");

type DesignOptionName = "wrappedBouquet" | "inVase" | "inLargeVase" | "box";

interface DesignOption {
  name: DesignOptionName;
  price: number;
  title: string;
}

const allDesignOptions: DesignOption[] = [
  {
    name: "wrappedBouquet",
    title: "Wrapped Bouquet",
    price: 0
  },
  {
    name: "inVase",
    title: "In Vase",
    price: 15000
  },
  {
    name: "inLargeVase",
    title: "In Large Vase",
    price: 30000
  },
  {
    name: "box",
    title: "Box",
    price: 0
  }
];

const getFBProductDisplayName = (product: any) =>
  product.displayNameAdmin || product.name.split("-").slice(1).join("-").trim();

const deduceProductTruePrice = (
  product: ProductWP,
  cartItem: { key: number; design?: string; size?: string; quantity: number }
) => {
  const subTotal = product.variants.length
    ? product.variants.find(variant => variant.name === cartItem.size)?.price ||
      0
    : product.price;
  if (subTotal === 0) {
    throw new BadRequestError("Invalid product or product size selected");
  }

  const designPrice = cartItem.design
    ? allDesignOptions.find(design => design.name === cartItem.design)?.price ||
      0
    : 0;
  return subTotal + designPrice;
};

const getFirebaseProducts: (skus: string[]) => Promise<any[]> = async skus => {
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

createOrder.post("/create", handleFormDataParsing(), async (req, res) => {
  try {
    const { user } = req;
    const client = user?.phone ? await handleContactHooks(user, "client") : {};

    const { cartItems, deliveryDate } = req.body as {
      cartItems: {
        key: number;
        design?: string;
        size?: string;
        quantity: number;
      }[];
      deliveryDate: string;
    };
    const _wpProducts = await ProductWPRepo.findByKeys(
      cartItems.map(item => item.key)
    );
    const wpProducts = cartItems
      .map(item => _wpProducts.find(prod => prod.key === item.key))
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

    if (wpProducts.length !== cartItems.length) {
      throw new BadRequestError("Some products not found");
    }

    const totalPrice = wpProducts.reduce((price, product, index) => {
      const cartItem = cartItems[index];
      const productPrice = deduceProductTruePrice(product, cartItem);
      return price + productPrice;
    }, 0);

    const fbProducts = await getFirebaseProducts(
      wpProducts.map(prod => prod.sku).filter(Boolean)
    );

    const orderProducts = fbProducts.map(prod => {
      const prodIndex = wpProducts.findIndex(_prod => _prod.sku === prod.SKU);
      const { quantity, size, design } = cartItems[prodIndex];
      return {
        name: prod.name,
        SKU: prod.SKU,
        size,
        design,
        quantity
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

    const payload: OrderCreate = {
      amount: totalPrice,
      orderProducts,
      orderDetails,
      client,
      paymentStatus: "Not Paid (Website - Bank Transfer)",
      cost: 0,
      deliveryDate: deliveryDate || "",
      admin: "regalflowersnigeria@gmail.com",
      adminNotes: "",
      anonymousClient: false,
      arrangementTime: "",
      business: "Regal Flowers",
      channel: "Regal Website",
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
      driverAlerted: false
    };

    const response = await db.add({
      ...payload,
      timestamp: firestore.FieldValue.serverTimestamp()
    });

    if (!response) {
      throw new NoDataError("Order not created");
    }

    const createdOrder = await db.doc(response.id).get();

    const createdOrderResponse = { ...createdOrder.data(), id: response.id };

    return new SuccessResponse("success", createdOrderResponse).send(res);
  } catch (error) {
    return ApiError.handle(error as Error, res);
  }
});

export default createOrder;
