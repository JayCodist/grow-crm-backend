import express from "express";
import verifyPaystack from "./verify-paystack";

const paymentRoutes = express.Router();

paymentRoutes.use("/paystack/verify", verifyPaystack);

export default paymentRoutes;
