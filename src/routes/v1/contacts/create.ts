import express from "express";
import { ApiError } from "../../../core/ApiError";
import { SuccessResponse } from "../../../core/ApiResponse";
import ContactsRepo from "../../../database/repository/ContactRepo";
import { handleFormDataParsing } from "../../../helpers/request-modifiers";
import validator from "../../../helpers/validator";
import validation from "./validation";

const createContact = express.Router();

createContact.post(
  "/create",
  handleFormDataParsing(),
  validator(validation.create, "body"),
  async (req, res) => {
    try {
      const response = await ContactsRepo.create(req.body);

      new SuccessResponse("success", response).send(res);
    } catch (error) {
      ApiError.handle(error as Error, res);
    }
  }
);

export default createContact;
