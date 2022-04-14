import express from "express";
import { ApiError, InternalError } from "../../../core/ApiError";
import {
  BadRequestResponse,
  SuccessMsgResponse,
  SuccessResponse
} from "../../../core/ApiResponse";
import ContactsRepo from "../../../database/repository/ContactRepo";
import { handleFormDataParsing } from "../../../helpers/request-modifiers";
import validator from "../../../helpers/validator";
import validation from "./validation";

const updateContact = express.Router();

updateContact.put(
  "/update/:id",
  handleFormDataParsing(),
  validator(validation.update, "body"),
  async (req, res) => {
    try {
      const response = await ContactsRepo.update(req);

      if (!response) {
        new BadRequestResponse("Contact not found").send(res);
      }
      new SuccessResponse("success", response).send(res);
    } catch (error) {
      ApiError.handle(new InternalError("Unable to update contact"), res);
    }
  }
);

export default updateContact;
