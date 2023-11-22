import express from "express";
import validator from "../../../helpers/validator";
import validation from "./validation";
import SubscriberRepo from "../../../database/repository/SubscriberRepo";
import { ApiError } from "../../../core/ApiError";
import { SuccessResponse } from "../../../core/ApiResponse";
import { SubscriberCreate } from "../../../database/model/Subscriber";

const subscribe = express.Router();

subscribe.post(
  "/",
  validator(validation.subscribe, "query"),
  async (req, res) => {
    try {
      const response = await SubscriberRepo.create({
        ...(req.query as SubscriberCreate)
      });
      return new SuccessResponse("Successfully subscribed", response).send(res);
    } catch (err) {
      return ApiError.handle(err as Error, res);
    }
  }
);

export default subscribe;
