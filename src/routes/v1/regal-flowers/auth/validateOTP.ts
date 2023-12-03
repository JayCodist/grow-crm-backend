import dayjs from "dayjs";
import express from "express";
import { ApiError, AuthFailureError } from "../../../../core/ApiError";
import { SuccessResponse } from "../../../../core/ApiResponse";
import OTPRecordRepo from "../../../../database/repository/OTPRecordRepo";
import UsersRepo from "../../../../database/repository/UserRepo";
import { handleFormDataParsing } from "../../../../helpers/request-modifiers";
import validator from "../../../../helpers/validator";
import validation from "./validation";
import { Business } from "../../../../database/model/Order";

const validateOTP = express.Router();

validateOTP.use(
  "/",
  handleFormDataParsing(),
  validator(validation.validateOTP, "body"),
  async (req, res) => {
    try {
      const { email, code, business } = req.body as {
        email: string;
        code: string;
        business: Business;
      };
      let user = await UsersRepo.findByEmail(email, business);
      if (!user) {
        throw new AuthFailureError("Email does not belong to existing user");
      }
      const OTPRecord = await OTPRecordRepo.findByEmail(email);
      if (!OTPRecord || OTPRecord.code !== code) {
        throw new AuthFailureError("One-time password is incorrect");
      }
      const tenMinsAgo = dayjs().subtract(10, "minute");
      const isOutdated = dayjs(OTPRecord.createdAt).isBefore(tenMinsAgo);
      await OTPRecordRepo.delete(OTPRecord.id);
      if (isOutdated) {
        throw new AuthFailureError("One-time password has expired");
      }
      if (user.isLegacyUser) {
        user = await UsersRepo.update(
          {
            id: user.id,
            isLegacyUser: false,
            legacyResolutionDate: dayjs().format()
          },
          business
        );
      }
      new SuccessResponse("success", user).send(res);
    } catch (error) {
      ApiError.handle(error as Error, res);
    }
  }
);

export default validateOTP;
