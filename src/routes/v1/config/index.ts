import express from "express";
import mobileVersionCheck from "./mobile-version-check";
import doWordpressSync from "./wordpress-sync";

const router = express.Router();

router.use("/mobile-version-check", mobileVersionCheck);
router.use("/wordpress-sync", doWordpressSync);

export default router;
