import express from "express";
import { ApiError, InternalError } from "../../../../core/ApiError";
import { SuccessResponse } from "../../../../core/ApiResponse";
import AuthRepo from "../../../../database/repository/AuthRepo";
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
      const response = await AuthRepo.signup(req.body);

      new SuccessResponse("success", response).send(res);
    } catch (error) {
      ApiError.handle(new InternalError("Unable to signup"), res);
    }
  }
);

export default signup;
