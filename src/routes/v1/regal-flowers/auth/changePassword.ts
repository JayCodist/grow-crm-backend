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
import { Business } from "../../../../database/model/Order";

const changePassword = express.Router();

changePassword.use(
  "/",
  handleFormDataParsing(),
  validator(validation.changePassword, "body"),
  handleAuthValidation(),
  async (req, res) => {
    try {
      const { password, business } = req.body as {
        password: string;
        business: Business;
      };
      const user = await UsersRepo.findById(req.user?.id as string, business);
      if (!user) {
        throw new AuthFailureError("User not found");
      }

      await UsersRepo.update({ password, id: user.id }, business);
      new SuccessResponse("Password changed successfully", user).send(res);
    } catch (error) {
      ApiError.handle(error as Error, res);
    }
  }
);

export default changePassword;
