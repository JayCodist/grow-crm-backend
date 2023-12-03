import express from "express";
import { ApiError, AuthFailureError } from "../../../../core/ApiError";
import { SuccessResponse } from "../../../../core/ApiResponse";
import OTPRecordRepo from "../../../../database/repository/OTPRecordRepo";
import UsersRepo from "../../../../database/repository/UserRepo";
import { sendEmailToAddress } from "../../../../helpers/messaging-helpers";
import { handleFormDataParsing } from "../../../../helpers/request-modifiers";
import validator from "../../../../helpers/validator";
import validation from "./validation";
import { Business } from "../../../../database/model/Order";

const requestOTP = express.Router();

requestOTP.use(
  "/",
  handleFormDataParsing(),
  validator(validation.requestOTP, "body"),
  async (req, res) => {
    try {
      const { email, business } = req.body as {
        email: string;
        business: Business;
      };
      const user = await UsersRepo.findByEmail(email, business);
      if (!user) {
        throw new AuthFailureError("Email does not belong to existing user");
      }
      const code = await OTPRecordRepo.createOTPRecord(email);
      await sendEmailToAddress(
        [email],
        `Your one-time password from ${business} is ${code}. This password expires in 10 minutes`,
        "One-time password"
      );
      new SuccessResponse("OTP sent successfully", null).send(res);
    } catch (error) {
      ApiError.handle(error as Error, res);
    }
  }
);

export default requestOTP;
