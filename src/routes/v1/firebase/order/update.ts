import express from "express";
import { ApiError } from "../../../../core/ApiError";
import {
  NotFoundResponse,
  SuccessResponse
} from "../../../../core/ApiResponse";
import firebaseAdmin from "../../../../helpers/firebase-admin";
import { handleFormDataParsing } from "../../../../helpers/request-modifiers";

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
}

const updateOrder = express.Router();

updateOrder.put("/update/:id", handleFormDataParsing(), async (req, res) => {
  try {
    const { firestore } = firebaseAdmin;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { deliveryStatus, paymentStatus, ...payload } = req.body as Order;

    const response = await firestore()
      .collection("orders")
      .doc(req.params.id)
      .update(payload as any);

    if (!response) {
      return new NotFoundResponse("Order not found").send(res);
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
});

export default updateOrder;
