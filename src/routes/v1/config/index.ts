import express from "express";
import mobileVersionCheck from "./mobile-version-check";
import doWordpressSync from "./wordpress-sync";

const configRoutes = express.Router();

configRoutes.use("/mobile-version-check", mobileVersionCheck);
configRoutes.use("/wordpress-sync", doWordpressSync);

export default configRoutes;
