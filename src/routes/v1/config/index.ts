import express from "express";
import mobileVersionCheck from "./mobile-version-check";

const router = express.Router();

router.use("/mobile-version-check", mobileVersionCheck);

export default router;
