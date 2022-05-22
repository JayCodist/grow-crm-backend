import express from "express";
import clientAccessLogCreate from "./client-access-logs/create";
import clientAccessLogList from "./client-access-logs/paginate";
import configRoutes from "./config";
import createContact from "./contacts/create";
import deleteContact from "./contacts/delete";
import contactLoglist from "./contacts/paginate";
import getRecord from "./contacts/record";
import updateContact from "./contacts/update";

const router = express.Router();

/*-------------------------------------------------------------------------*/
// Below all APIs are public APIs protected by api-key
router.use("/", async (req, res, next) => {
  // Check API key later
  next();
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

export default router;
