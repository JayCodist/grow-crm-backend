import express from "express";
import { firestore } from "firebase-admin";
import {
  handleAuthValidation,
  handleFormDataParsing
} from "../../../../helpers/request-modifiers";
import validator from "../../../../helpers/validator";
import validation from "./validation";
import { UserCreate } from "../../../../database/model/User";
import { handleContactHooks } from "./utils";
import { ApiError } from "../../../../core/ApiError";
import { SuccessResponse } from "../../../../core/ApiResponse";

export const saveSendersInfo = express.Router();

const db = firestore();

saveSendersInfo.put(
  "/:id",
  handleFormDataParsing(),
  validator(validation.saveSenderInfo, "body"),
  handleAuthValidation(true),
  async (req, res) => {
    try {
      const { userData, deliveryDate } = req.body as {
        userData: UserCreate;
        deliveryDate: string;
      };

      const client = await handleContactHooks(userData, "client");

      await db.collection("orders").doc(req.params.id).update({
        client,
        deliveryDate
      });
      return new SuccessResponse("Information saved successfully", client).send(
        res
      );
    } catch (error) {
      return ApiError.handle(error as Error, res);
    }
  }
);
