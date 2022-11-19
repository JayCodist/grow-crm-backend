import express from "express";
import login from "./login";
import signup from "./signup";

const authRoutes = express.Router();

authRoutes.post("/login", login);
authRoutes.post("/signup", signup);

export default authRoutes;
