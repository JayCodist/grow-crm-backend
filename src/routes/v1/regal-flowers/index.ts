import express from "express";
import authRoutes from "./auth";
import handshake from "./handshake";
import subscribe from "./subscribe";

const regalFlowersRoutes = express.Router();

regalFlowersRoutes.use("/auth", authRoutes);

regalFlowersRoutes.use("/handshake", handshake);

regalFlowersRoutes.use("/subscribe", subscribe);

export default regalFlowersRoutes;
