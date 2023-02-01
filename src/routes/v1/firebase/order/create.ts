import express from "express";
import {
  ApiError,
  BadRequestError,
  NoDataError
} from "../../../../core/ApiError";
import { SuccessResponse } from "../../../../core/ApiResponse";
import { Order, OrderActor } from "../../../../database/model/Order";
import { ProductWP } from "../../../../database/model/ProductWP";
import User from "../../../../database/model/User";
import ProductWPRepo from "../../../../database/repository/ProductWPRepo";
import firebaseAdmin from "../../../../helpers/firebase-admin";
import { handleFormDataParsing } from "../../../../helpers/request-modifiers";

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
  return responses.flat();
};

const handleClientHooks: (
  user?: Omit<User, "password">
) => Promise<OrderActor> = async user => {
  let client: OrderActor = {};
  if (user?.phone) {
    const { docs } = await firestore()
      .collection("contacts")
      .where("phones", "array-contains", user.phone)
      .limit(1)
      .get();
    client = docs[0]?.exists ? { id: docs[0].id, ...docs[0].data() } : {};
  }
  if (client.id) {
    // Update client if changed
    if (
      (user?.name && client.name !== user?.name) ||
      (user?.email && client.email !== user?.email) ||
      !client.category?.includes("client")
    ) {
      await firestore()
        .collection("contacts")
        .doc(client.id)
        .update({
          ...client,
          name: user?.name || client.name,
          email: user?.email || client.email,
          category: Array.from(new Set([...(client.category || []), "client"]))
        });
    }
  } else {
    // Create new client
    const contactData = {
      firstname: (user?.name || "").split(" ")[0],
      lastname: (user?.name || "").split(" ")[1],
      address: [],
      category: ["client"],
      phone: user?.phone || "",
      phoneAlt: "",
      phoneAlt2: "",
      phones: [user?.phone].filter(Boolean),
      email: user?.email,
      timestamp: firestore.FieldValue.serverTimestamp()
    } as OrderActor;
    const doc = await firestore().collection("contacts").add(contactData);
    client = { id: doc.id, ...contactData };
  }
  return client;
};

createOrder.post("/create", handleFormDataParsing(), async (req, res) => {
  try {
    const { user } = req;
    const client = await handleClientHooks(user);

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

    const orderDetails = orderProducts
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

    const payload: Order = {
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
      contactDepsArray: [client.id] as string[],
      costBreakdown: "",
      deliveryMessage: "", // Set laster
      deliveryNotePrinted: false,
      deliveryStatus: "Not Arranged",
      deliveryZone: "WEB",
      despatchFrom: "Unselected",
      driver: {},
      editingAdminsRevised: [],
      feedback: {},
      isClientRecipient: false, // Set later
      isDuplicatedOrder: false,
      lastDeliveryNotePrintedAdmin: "",
      lastDeliveryNotePrintedTime: "",
      lastDeliveryStatusAdmin: "",
      lastDeliveryStatusTime: "",
      lastMessagePrintedAdmin: "",
      lastMessagePrintedTime: "",
      lastPaymentStatusAdmin: "",
      lastPaymentStatusTime: "",
      line: "Unselected",
      messagePrinted: false,
      profit: 0,
      purpose: "Unknown", // Set later
      recipient: {}, // Resolve on the backend
      recipientAddress: "", // Set later
      receivedByName: "",
      receivedByPhone: "",
      sendReminders: false, // Set later
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
