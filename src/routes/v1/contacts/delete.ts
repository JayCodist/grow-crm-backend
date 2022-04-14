import express from "express";
import { ApiError, InternalError } from "../../../core/ApiError";
import {
  BadRequestResponse,
  SuccessMsgResponse
} from "../../../core/ApiResponse";
import ContactsRepo from "../../../database/repository/ContactRepo";
import validator from "../../../helpers/validator";
import validation from "./validation";

const deleteContact = express.Router();

deleteContact.delete(
  "/delete/:id",
  validator(validation.delete, "params"),
  async (req, res) => {
    try {
      const response = await ContactsRepo.delete(req);
      if (!response) {
        new BadRequestResponse("Contact not found").send(res);
      }

      new SuccessMsgResponse("success").send(res);
    } catch (error) {
      ApiError.handle(new InternalError("Unable to update contact"), res);
    }
  }
);

export default deleteContact;
