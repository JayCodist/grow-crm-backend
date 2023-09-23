import express from "express";
import { ApiError, BadRequestError } from "../../../../core/ApiError";
import {
  NotFoundResponse,
  SuccessResponse
} from "../../../../core/ApiResponse";
import firebaseAdmin from "../../../../helpers/firebase-admin";
import {
  CartItem,
  OrderItemImage,
  deduceProductTruePrice,
  getFBProductDisplayName,
  getWpProducts
} from "./create";
import ProductWPRepo from "../../../../database/repository/ProductWPRepo";
import { getAdminNoteText } from "../../../../helpers/formatters";

interface OrderProduct extends CartItem {
  name: string;
  SKU: string;
  quantity: number;
  image: OrderItemImage;
  key: number;
}

const orderID = express.Router();

orderID.get("/:id", async (req, res) => {
  try {
    const { firestore } = firebaseAdmin;

    const response = await Promise.all([
      firestore().collection("orders").doc(req.params.id).get(),
      firestore().collection("business").get()
    ]);

    const order = response[0].data();
    const business = response[1].docs.map(doc => doc.data());

    if (!order) {
      return new NotFoundResponse("Order not found").send(res);
    }

    const orderItems: OrderProduct[] = order?.orderProducts;

    const _wpProducts = await ProductWPRepo.findByKeys(
      orderItems.map((item: OrderProduct) => item.key) as number[]
    );

    const wpProducts = getWpProducts(orderItems, _wpProducts);

    if (wpProducts.length !== orderItems.length) {
      throw new BadRequestError("Some products not found");
    }

    const totalPrice =
      wpProducts.reduce((price, product, index) => {
        const cartItem = orderItems[index];
        const productPrice = deduceProductTruePrice(product, cartItem);
        return price + productPrice * cartItem.quantity;
      }, 0) + order.deliveryAmount || 0;

    if (totalPrice !== order.amount) {
      const orderProducts = wpProducts.map(prod => {
        const orderItem = orderItems.find(
          item => item.SKU === prod.sku
        ) as OrderProduct;
        const productPrice = deduceProductTruePrice(prod, orderItem);
        return {
          ...orderItem,
          price: productPrice
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
                  orderItems[wpProductIndex]
                )
              : 0;
          return `${
            product.quantity > 1 ? `${String(product.quantity)} TIMES ` : ""
          } ${getFBProductDisplayName(product)} (${price * product.quantity})`;
        })
        .join(" + ");
      orderDetails += `${
        order.deliveryAmount ? `+ delivery (${order.deliveryAmount})` : ""
      } = ${totalPrice}`;

      const adminNotes = getAdminNoteText(
        order.adminNotes,
        order.currency,
        totalPrice
      );

      await firestore().collection("orders").doc(req.params.id).update({
        amount: totalPrice,
        orderDetails,
        orderProducts,
        adminNotes
      });

      order.amount = totalPrice;
      order.orderDetails = orderDetails;
      order.adminNotes = adminNotes;
      order.orderProducts = orderProducts;
    }

    const businessLetter = business.find(
      bus => bus.name === order?.business
    )?.letter;

    const adminNotes = order?.adminNotes.replace(
      /([£$]\d+(?:[.,]\d{2})?)/gu,
      ""
    );

    const data = {
      ...order,
      fullOrderId: `${businessLetter}${order?.deliveryZone}${order?.orderID}W`,
      id: req.params.id,
      adminNotes
    };

    return new SuccessResponse("success", data).send(res);
  } catch (error) {
    return ApiError.handle(error as Error, res);
  }
});

export default orderID;
