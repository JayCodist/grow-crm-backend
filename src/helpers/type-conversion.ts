import { firestore } from "firebase-admin";
import { Business, Order } from "../database/model/Order";
import { sendEmailToAddress } from "./messaging-helpers";
import {
  businessEmailMap,
  businessOrderPathMap,
  businessTemplateIdMap
} from "../database/repository/utils";
import { templateRender } from "./render";

const db = firestore();

export const handleFailedVerification = async (
  orderId: string,
  business: Business
) => {
  const snap = await db
    .collection("orders")
    .doc(orderId as string)
    .get();
  const order = snap.data() as Order | undefined;

  if (order) {
    await firestore()
      .collection("orders")
      .doc(orderId as string)
      .update({
        paymentStatus: "PAID - GO AHEAD (Website - Card)",
        adminNotes: `${order.adminNotes} (Ver Failed)`
      });

    await sendEmailToAddress(
      [businessEmailMap[business]],
      templateRender(
        { ...order, currency: "USD" },
        businessOrderPathMap[business],
        business
      ),
      `Warning a New Order Ver Failed (${order.fullOrderId})`,
      businessTemplateIdMap[business],
      business
    );
    await sendEmailToAddress(
      [order.client.email as string],
      templateRender({ ...order }, businessOrderPathMap[business], business),
      `Thank you for your order (${order.fullOrderId})`,
      businessTemplateIdMap[business],
      business
    );
  } else {
    await sendEmailToAddress(
      [businessEmailMap[business]],
      "Order not found",
      `Could not complete payment verification for order: ${orderId} for business: ${business}`
    );
  }
};
