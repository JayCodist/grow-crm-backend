import express from "express";
import firebaseAdmin from "../../helpers/firebase-admin";
import categoryWP from "./category-wp/paginate";
import clientAccessLogCreate from "./client-access-logs/create";
import clientAccessLogList from "./client-access-logs/paginate";
import configRoutes from "./config";
import createContact from "./contacts/create";
import deleteContact from "./contacts/delete";
import contactLoglist from "./contacts/paginate";
import getRecord from "./contacts/record";
import updateContact from "./contacts/update";
import productWP from "./product-wp/paginate";

const router = express.Router();

// TODO: remove this when seen
const { firestore } = firebaseAdmin;
firestore()
  .collection("channels")
  .get()
  .then(snap => {
    console.log(snap.docs.length);
  });

/*-------------------------------------------------------------------------*/
// Below all APIs are public APIs protected by api-key
router.use("/", async (req, res) => {
  // Implement security later
  res.json({
    app: "Regal Flowers",
    version: "V1",
    author: "jaycodist@gmail.com"
  });
});
/*-------------------------------------------------------------------------*/

router.use("/client-access-logs/paginate", clientAccessLogList);
router.use("/client-access-logs/create", clientAccessLogCreate);

router.use("/config", configRoutes);

router.use("/contacts", createContact);
router.use("/contacts", contactLoglist);
router.use("/contacts", updateContact);
router.use("/contacts", deleteContact);
router.use("/contacts", getRecord);

router.use("/product-wp", productWP);

router.use("/category-wp", categoryWP);

export default router;
