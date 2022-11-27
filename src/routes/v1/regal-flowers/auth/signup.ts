import express from "express";
import { ApiError } from "../../../../core/ApiError";
import { SuccessResponse } from "../../../../core/ApiResponse";
import UsersRepo from "../../../../database/repository/UserRepo";
import { handleFormDataParsing } from "../../../../helpers/request-modifiers";
import validator from "../../../../helpers/validator";
import validation from "./validation";

const signup = express.Router();

signup.use(
  "/",
  handleFormDataParsing(),
  validator(validation.signup, "body"),
  async (req, res) => {
    try {
      const response = await UsersRepo.signup(req.body);

      new SuccessResponse("success", response).send(res);
    } catch (error) {
      ApiError.handle(error as Error, res);
    }
  }
);

export default signup;
