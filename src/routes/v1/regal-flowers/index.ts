import express from "express";
import authRoutes from "./auth";

const regalFlowersRoutes = express.Router();

regalFlowersRoutes.use("/auth", authRoutes);

export default regalFlowersRoutes;
