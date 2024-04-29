import { firestore } from "firebase-admin";
import { Business, Order, PaymentStatus } from "../database/model/Order";
import { sendEmailToAddress } from "./messaging-helpers";
import {
  businessEmailMap,
  businessOrderPathMap,
  businessTemplateIdMap
} from "../database/repository/utils";
import { templateRender } from "./render";
import { PaymentType } from "../database/model/PaymentLog";

const db = firestore();
const recentOrderChangesDb = firestore().collection("recentOrderChanges");

export const paymentProviderStatusMap: Record<PaymentType, PaymentStatus> = {
  paypal: "PAID - GO AHEAD (Paypal)",
  paystack: "PAID - GO AHEAD (Website - Card)",
  monnify: "PAID - GO AHEAD (Bank Transfer)",
  manualTransfer: "PAID - GO AHEAD (Bank Transfer)"
};

export const recentOrderChangesUpdate = async (
  orderId: string,
  updates: Record<string, any>
) => {
  const recentOrderChanges = await firestore()
    .collection("recentOrderChanges")
    .where("orderid", "==", orderId)
    .get();
  if (recentOrderChanges.docs[0].exists) {
    await recentOrderChangesDb.doc(recentOrderChanges.docs[0].id).update({
      type: "edit",
      updates,
      timestamp: firestore.FieldValue.serverTimestamp(),
      time: new Date().toISOString()
    });
  }
};

export const handleFailedVerification = async (
  orderId: string,
  business: Business,
  paymentType: PaymentType
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
        paymentStatus: paymentProviderStatusMap[paymentType],
        adminNotes: `${order.adminNotes} (Ver Failed)`
      });

    await recentOrderChangesUpdate(orderId, {
      name: "paymentStatus",
      old: order.paymentStatus,
      new: paymentProviderStatusMap[paymentType]
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
