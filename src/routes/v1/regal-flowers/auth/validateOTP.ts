import express from "express";
import { ApiError, AuthFailureError } from "../../../../core/ApiError";
import { SuccessResponse } from "../../../../core/ApiResponse";
import OTPRecordRepo from "../../../../database/repository/OTPRecordRepo";
import UsersRepo from "../../../../database/repository/UserRepo";
import { handleFormDataParsing } from "../../../../helpers/request-modifiers";
import validator from "../../../../helpers/validator";
import validation from "./validation";

const validateOTP = express.Router();

validateOTP.use(
  "/",
  handleFormDataParsing(),
  validator(validation.validateOTP, "body"),
  async (req, res) => {
    try {
      const { email, code } = req.body;
      const user = await UsersRepo.findByEmail(email);
      if (!user) {
        throw new AuthFailureError("Email does not belong to existing user");
      }
      const OTPRecord = await OTPRecordRepo.findByEmail(email);
      if (!OTPRecord || OTPRecord.code !== code) {
        throw new AuthFailureError("One-time password is incorrect");
      }
      await OTPRecordRepo.delete(OTPRecord.id);

      new SuccessResponse("success", user).send(res);
    } catch (error) {
      ApiError.handle(error as Error, res);
    }
  }
);

export default validateOTP;
