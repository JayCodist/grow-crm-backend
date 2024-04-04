import express from "express";
import clientAccessLogCreate from "./client-access-logs/create";
import clientAccessLogList from "./client-access-logs/paginate";
import configRoutes from "./config";
import createContact from "./contacts/create";
import deleteContact from "./contacts/delete";
import contactLoglist from "./contacts/paginate";
import getRecord from "./contacts/record";
import updateContact from "./contacts/update";
import checkoutOrder from "./firebase/order/checkout-order";
import createOrder from "./firebase/order/create";
import orderID from "./firebase/order/order-id";
import purposes from "./firebase/purpose/purpose";
import zoneGroup from "./firebase/zone/zone-group";
import regalFlowersRoutes from "./regal-flowers";
import paymentRoutes from "./regal-flowers/payments";
import categoryWP from "./wordpress/category-wp/paginate";
import wordpressProductRoutes from "./wordpress/product-wp";
import residentTypes from "./firebase/residentType/residentType";
import { updateOrder } from "./firebase/order/update";
import { saveSendersInfo } from "./firebase/order/save-senders-info";
import updatePaymentMethodDetails from "./firebase/order/update-payment-details";
import categoryWPSlug from "./wordpress/category-wp/category-slug";
import floralhubRoutes from "./floral-hub";
import blogRoutes from "./blog";
import blogCategoryRoutes from "./blog-category";

const router = express.Router();

/*-------------------------------------------------------------------------*/
// Below all APIs are public APIs protected by api-key
// router.use("/", async (req, res) => {
//   // Implement security later
//   res.json({
//     app: "Regal Flowers",
//     version: "V1",
//     author: "jaycodist@gmail.com"
//   });
// });

router.use("/firebase/order", orderID);
router.use("/firebase/order", createOrder);
router.use("/firebase/order", updateOrder);
router.use("/firebase/order/checkout-order", checkoutOrder);
router.use("/firebase/order/save-sender-info", saveSendersInfo);
router.use(
  "/firebase/order/update-payment-details",
  updatePaymentMethodDetails
);

// Deprecated
// router.use("/firebase/order", updateOrder);

router.use("/firebase/zone", zoneGroup);
router.use("/firebase/purposes", purposes);
router.use("/firebase/resident-types", residentTypes);

/*-------------------------------------------------------------------------*/

router.use("/client-access-logs/paginate", clientAccessLogList);
router.use("/client-access-logs/create", clientAccessLogCreate);

router.use("/config", configRoutes);

router.use("/contacts", createContact);
router.use("/contacts", contactLoglist);
router.use("/contacts", updateContact);
router.use("/contacts", deleteContact);
router.use("/contacts", getRecord);

router.use("/wordpress/product", wordpressProductRoutes);

router.use("/wordpress/category", categoryWP);
router.use("/wordpress/category/single", categoryWPSlug);

router.use("/payments", paymentRoutes);

router.use("/regal", regalFlowersRoutes);

router.use("/floralhub", floralhubRoutes);

router.use("/blog", blogRoutes);

router.use("/blog/category", blogCategoryRoutes);

export default router;
