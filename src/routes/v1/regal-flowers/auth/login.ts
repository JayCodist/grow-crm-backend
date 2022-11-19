import express from "express";
import { ApiError } from "../../../../core/ApiError";
import { SuccessResponse } from "../../../../core/ApiResponse";
import AuthRepo from "../../../../database/repository/AuthRepo";
import { handleFormDataParsing } from "../../../../helpers/request-modifiers";
import validator from "../../../../helpers/validator";
import validation from "./validation";

const login = express.Router();

login.use(
  "/",
  handleFormDataParsing(),
  validator(validation.login, "body"),
  async (req, res) => {
    try {
      const { email, password } = req.body;
      const response = await AuthRepo.login(email, password);

      new SuccessResponse("success", response).send(res);
    } catch (error) {
      ApiError.handle(error as Error, res);
    }
  }
);

export default login;
