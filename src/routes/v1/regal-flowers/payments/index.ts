import express from "express";
import verifyPaystack from "./verify-paystack";

const paymentRoutes = express.Router();

paymentRoutes.use("/verify-payment-paystack", verifyPaystack);

export default paymentRoutes;
