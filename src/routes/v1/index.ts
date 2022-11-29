import express from "express";
import clientAccessLogCreate from "./client-access-logs/create";
import clientAccessLogList from "./client-access-logs/paginate";
import configRoutes from "./config";
import createContact from "./contacts/create";
import deleteContact from "./contacts/delete";
import contactLoglist from "./contacts/paginate";
import getRecord from "./contacts/record";
import updateContact from "./contacts/update";
import createOrder from "./firebase/order/create";
import orderID from "./firebase/order/order-id";
import updateOrder from "./firebase/order/update";
import zoneGroup from "./firebase/zone/zone-group";
import regalFlowersRoutes from "./regal-flowers";
import paymentRoutes from "./regal-flowers/payments";
import categoryWP from "./wordpress/category-wp/paginate";
import wordpressProductRoutes from "./wordpress/product-wp";

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

router.use("/firebase/zone", zoneGroup);

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

router.use("/payments", paymentRoutes);

router.use("/regal", regalFlowersRoutes);

export default router;
