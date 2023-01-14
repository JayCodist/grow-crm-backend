import express from "express";
import verifyMonnify from "./verify-monnify";
import verifyPaypal from "./verify-paypal";
import verifyPaystack from "./verify-paystack";

const paymentRoutes = express.Router();

paymentRoutes.use("/paystack/verify", verifyPaystack);

paymentRoutes.use("/monnify/verify", verifyMonnify);

paymentRoutes.use("/paypal/verify", verifyPaypal);

export default paymentRoutes;
