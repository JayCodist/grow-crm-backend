import express from "express";
import { ApiError } from "../../../core/ApiError";
import { BadRequestResponse, SuccessResponse } from "../../../core/ApiResponse";
import ContactsRepo from "../../../database/repository/ContactRepo";
import validator from "../../../helpers/validator";
import validation from "./validation";

const getRecord = express.Router();

getRecord.get(
  "/record/:id",
  validator(validation.record, "params"),
  async (req, res) => {
    try {
      const response = await ContactsRepo.findById(req.params.id);

      if (!response) {
        new BadRequestResponse("Contact not found").send(res);
      }
      new SuccessResponse("success", response).send(res);
    } catch (error) {
      ApiError.handle(error as Error, res);
    }
  }
);

export default getRecord;
