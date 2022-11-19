import express from "express";
import { ApiError } from "../../../core/ApiError";
import { BadRequestResponse, SuccessResponse } from "../../../core/ApiResponse";
import Contact from "../../../database/model/Contacts";
import ContactsRepo from "../../../database/repository/ContactRepo";
import { handleFormDataParsing } from "../../../helpers/request-modifiers";
import { PartialLoose } from "../../../helpers/type-helpers";
import validator from "../../../helpers/validator";
import validation from "./validation";

const updateContact = express.Router();

updateContact.put(
  "/update/:id",
  handleFormDataParsing(),
  validator(validation.update, "body"),
  async (req, res) => {
    try {
      const payload: PartialLoose<Contact> = {
        id: req.params.id,
        ...req.body
      };
      const response = await ContactsRepo.update(payload);

      if (!response) {
        new BadRequestResponse("Contact not found").send(res);
      }
      new SuccessResponse("success", response).send(res);
    } catch (error) {
      ApiError.handle(error as Error, res);
    }
  }
);

export default updateContact;
