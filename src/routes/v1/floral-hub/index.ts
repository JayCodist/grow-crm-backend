import express from "express";
import clientMessage from "./client-message";

const floralhubRoutes = express.Router();

floralhubRoutes.use("/client-message", clientMessage);

export default floralhubRoutes;
