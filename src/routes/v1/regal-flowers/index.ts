import express from "express";
import authRoutes from "./auth";
import handshake from "./handshake";

const regalFlowersRoutes = express.Router();

regalFlowersRoutes.use("/auth", authRoutes);

regalFlowersRoutes.use("/handshake", handshake);

export default regalFlowersRoutes;
