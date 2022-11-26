import express from "express";
import changePassword from "./changePassword";
import login from "./login";
import requestOTP from "./requestOTP";
import signup from "./signup";

const authRoutes = express.Router();

authRoutes.post("/login", login);
authRoutes.post("/signup", signup);

authRoutes.post("/otp/request", requestOTP);

authRoutes.put("/otp/change-password", changePassword);

export default authRoutes;
