import express from "express";
import categoryWP from "./category-wp/paginate";
import clientAccessLogCreate from "./client-access-logs/create";
import clientAccessLogList from "./client-access-logs/paginate";
import configRoutes from "./config";
import createContact from "./contacts/create";
import deleteContact from "./contacts/delete";
import contactLoglist from "./contacts/paginate";
import getRecord from "./contacts/record";
import updateContact from "./contacts/update";
import orderID from "./firebase/order-id";
import allProductWp from "./product-wp/all";
import productWP from "./product-wp/paginate";
import productWPSlug from "./product-wp/product-slug";

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

/*-------------------------------------------------------------------------*/

router.use("/client-access-logs/paginate", clientAccessLogList);
router.use("/client-access-logs/create", clientAccessLogCreate);

router.use("/config", configRoutes);

router.use("/contacts", createContact);
router.use("/contacts", contactLoglist);
router.use("/contacts", updateContact);
router.use("/contacts", deleteContact);
router.use("/contacts", getRecord);

router.use("/product-wp", allProductWp);
router.use("/product-wp", productWP);
router.use("/product-wp", productWPSlug);

router.use("/category-wp", categoryWP);

export default router;
