import dayjs, { Dayjs } from "dayjs";
import { firestore } from "firebase-admin";
import { Business, Order } from "../../../../database/model/Order";
import { businessEmailMap } from "../../../../database/repository/utils";
import { sendEmailToAddress } from "../../../../helpers/messaging-helpers";

export const performDeliveryDateNormalization: (
  order: Order,
  business: Business
) => Promise<string> = async (order, business) => {
  const currentDate = dayjs();
  const oldDeliveryDate = order.deliveryDate ? dayjs(order.deliveryDate) : null;
  const isPickup = /pickup/i.test(order.recipient.name || "");
  // If order is for today and the time is past 11:50pm, move it to the next day (for pickup)
  const safeDeliveryDateThresholdForPickup =
    currentDate.hour() > 23 && currentDate.minute() >= 50
      ? currentDate.add(1, "day")
      : currentDate;
  // If order is for today and the time is past 9pm, move it to the next day (for delivery)
  const safeDeliveryDateThresholdForDelivery =
    currentDate.hour() > 21 ? currentDate.add(1, "day") : currentDate;

  let newDeliveryDate: Dayjs;

  if (
    !oldDeliveryDate ||
    !oldDeliveryDate.isValid ||
    oldDeliveryDate.isBefore(currentDate, "day")
  ) {
    // Safely move order delivery date to current date
    newDeliveryDate = isPickup
      ? safeDeliveryDateThresholdForPickup
      : safeDeliveryDateThresholdForDelivery;
  } else if (oldDeliveryDate.isSame(currentDate, "day")) {
    // Safely move order delivery date to current date
    newDeliveryDate = isPickup
      ? safeDeliveryDateThresholdForPickup
      : safeDeliveryDateThresholdForDelivery;
  } else {
    newDeliveryDate = oldDeliveryDate;
  }
  const deliveryDateChanged = !newDeliveryDate.isSame(oldDeliveryDate, "day");
  const infoMessage = deliveryDateChanged
    ? `Delivery date has been set to ${newDeliveryDate.format(
        "D MMMM YYYY"
      )} for logistsics reasons.` +
      ` Please reach out to ${businessEmailMap[business]} if you wish to change this`
    : "";

  if (deliveryDateChanged) {
    await firestore()
      .collection("orders")
      .doc(order.id)
      .update({ deliveryDate: newDeliveryDate.format("YYYY-MM-DD") });

    // Only send warning email if delivery date was today
    if (oldDeliveryDate?.isSame(currentDate, "day")) {
      sendEmailToAddress(
        [businessEmailMap[business]],
        `
      <p>
        Delivery Date changed to ${newDeliveryDate.format(
          "D MMMM YYYY"
        )} automatically for order: ${order.orderID},
        by client: ${order.client.name}, ${order.client.phone} ${
          order.client.phoneAlt2
        }
        <br>
        Message received by client: <br>
        "${infoMessage}"
      </p>
    `,
        "Delivery Date Change"
      );
    }
  }

  return infoMessage;
};
