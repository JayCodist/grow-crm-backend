import express from "express";
import { ApiError, AuthFailureError } from "../../../../core/ApiError";
import { SuccessResponse } from "../../../../core/ApiResponse";
import OTPRecordRepo from "../../../../database/repository/OTPRecordRepo";
import UsersRepo from "../../../../database/repository/UserRepo";
import { handleFormDataParsing } from "../../../../helpers/request-modifiers";
import validator from "../../../../helpers/validator";
import validation from "./validation";

const changePassword = express.Router();

changePassword.use(
  "/",
  handleFormDataParsing(),
  validator(validation.changePassword, "body"),
  async (req, res) => {
    try {
      const { email, password, code } = req.body;
      const user = await UsersRepo.findByEmail(email);
      if (!user) {
        throw new AuthFailureError("Email does not belong to existing user");
      }
      const OTPRecord = await OTPRecordRepo.findByEmail(email);
      if (!OTPRecord || OTPRecord.code !== code) {
        throw new AuthFailureError("One-time password is incorrect");
      }
      await OTPRecordRepo.delete(OTPRecord.id);
      await UsersRepo.update({ password, id: user.id });
      new SuccessResponse("Password changed successfully", user).send(res);
    } catch (error) {
      ApiError.handle(error as Error, res);
    }
  }
);

export default changePassword;
