import express from "express";
import { ApiError } from "../../../../core/ApiError";
import { SuccessResponse } from "../../../../core/ApiResponse";
import OTPRecordRepo from "../../../../database/repository/OTPRecordRepo";
import { sendEmailToAddress } from "../../../../helpers/messaging-helpers";
import { handleFormDataParsing } from "../../../../helpers/request-modifiers";
import validator from "../../../../helpers/validator";
import validation from "./validation";

const requestOTP = express.Router();

requestOTP.use(
  "/",
  handleFormDataParsing(),
  validator(validation.requestOTP, "body"),
  async (req, res) => {
    try {
      const { email } = req.body;
      const OTPRecord = await OTPRecordRepo.createOTPRecord(email);
      await sendEmailToAddress(
        [email],
        `Your one-time password from regalflowers is ${OTPRecord.code}. This code expires in 10 minutes`,
        "One-time password"
      );
      new SuccessResponse("success", null).send(res);
    } catch (error) {
      ApiError.handle(error as Error, res);
    }
  }
);

export default requestOTP;
