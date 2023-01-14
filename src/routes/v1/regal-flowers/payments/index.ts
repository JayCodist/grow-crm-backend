import express from "express";
import verifyMonnify from "./verify-monnify";
import verifyPaystack from "./verify-paystack";

const paymentRoutes = express.Router();

paymentRoutes.use("/paystack/verify", verifyPaystack);

paymentRoutes.use("/monnify/verify", verifyMonnify);

export default paymentRoutes;
