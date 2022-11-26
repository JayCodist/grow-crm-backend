import express from "express";
import login from "./login";
import requestOTP from "./requestOTP";
import signup from "./signup";

const authRoutes = express.Router();

authRoutes.post("/login", login);
authRoutes.post("/signup", signup);

authRoutes.post("/otp/request", requestOTP);

export default authRoutes;
