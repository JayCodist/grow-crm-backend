import express from "express";
import changePassword from "./changePassword";
import login from "./login";
import requestOTP from "./requestOTP";
import signup from "./signup";
import validateOTP from "./validateOTP";

const authRoutes = express.Router();

authRoutes.post("/login", login);
authRoutes.post("/signup", signup);

authRoutes.post("/otp/request", requestOTP);
authRoutes.post("/otp/validate", validateOTP);
authRoutes.put("/otp/change-password", changePassword);

export default authRoutes;
