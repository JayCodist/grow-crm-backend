import express from "express";
import mobileVersionCheck from "./mobile-version-check";
import getWPProduct from "./wordpress-proxy";

const router = express.Router();

router.use("/mobile-version-check", mobileVersionCheck);
router.use("/wordpress-proxy/products", getWPProduct);

export default router;
