import express from "express";
import { ApiError, AuthFailureError } from "../../../../core/ApiError";
import { SuccessResponse } from "../../../../core/ApiResponse";
import UsersRepo from "../../../../database/repository/UserRepo";
import {
  handleAuthValidation,
  handleFormDataParsing
} from "../../../../helpers/request-modifiers";
import validator from "../../../../helpers/validator";
import validation from "./validation";

const changePassword = express.Router();

changePassword.use(
  "/",
  handleFormDataParsing(),
  validator(validation.changePassword, "body"),
  handleAuthValidation(),
  async (req, res) => {
    try {
      const { password } = req.body;
      const user = await UsersRepo.findByEmail(req.user?.email || "");
      if (!user) {
        throw new AuthFailureError("User not found");
      }

      await UsersRepo.update({ password, id: user.id });
      new SuccessResponse("Password changed successfully", user).send(res);
    } catch (error) {
      ApiError.handle(error as Error, res);
    }
  }
);

export default changePassword;
