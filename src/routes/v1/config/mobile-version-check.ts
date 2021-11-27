import express from "express";
import { ApiError, InternalError } from "../../../core/ApiError";
import { SuccessResponse } from "../../../core/ApiResponse";
import MobileVersionCheckRepo from "../../../database/repository/MobileVersionCheckRepo";
import validator from "../../../helpers/validator";
import validation from "./validation";

const mobileVersionCheck = express.Router();

mobileVersionCheck.get(
  "/",
  validator(validation.mobileVersionCheck, "query"),
  async (req, res) => {
    try {
      const { version, os } = req.query as unknown as {
        version: number;
        os: "ios" | "android";
      };
      const handler =
        os === "android"
          ? MobileVersionCheckRepo.checkAndroidVersion
          : MobileVersionCheckRepo.checkIOSVersion;
      const isValid = await handler(version);
      new SuccessResponse("success", isValid).send(res);
    } catch (e) {
      ApiError.handle(
        new InternalError(
          "Failed to validate version. Please contact your administrator"
        ),
        res
      );
    }
  }
);

export default mobileVersionCheck;
