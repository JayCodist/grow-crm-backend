import express from "express";
import { sendEmailToAddress } from "../../../helpers/messaging-helpers";
import { clientMessageTemplateRender } from "../../../helpers/render";
import { SuccessResponse } from "../../../core/ApiResponse";
import validation from "./validation";
import validator from "../../../helpers/validator";
import { ApiError } from "../../../core/ApiError";

const clientMessage = express.Router();

clientMessage.post(
  "/",
  validator(validation.clientMessage, "body"),
  async (req, res) => {
    try {
      const { message, email, name } = req.body;

      await sendEmailToAddress(
        ["info@floralhub.com.ng", "bellotaiwolateef1999@gmail.com"],
        clientMessageTemplateRender({ message, email, name }),
        `Client Enquiry - Contact Us`,
        "floralHub"
      );

      return new SuccessResponse("Message sent successfully", true).send(res);
    } catch (error) {
      return ApiError.handle(error as Error, res);
    }
  }
);

export default clientMessage;
