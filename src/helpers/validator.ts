import Joi from "@hapi/joi";
import { NextFunction, Request, Response } from "express";
import { BadRequestError } from "../core/ApiError";
import Logger from "../core/Logger";

export type ValidationSource = "body" | "headers" | "query" | "params";

const validator = (schema: Joi.ObjectSchema, source: ValidationSource) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const { error } = schema.validate(req[source]);

      if (!error) {
        next();
        return;
      }

      const { details } = error;
      const message = details
        .map((i) => i.message.replace(/['"]+/g, ""))
        .join(",");
      Logger.error(message);

      next(new BadRequestError(message));
    } catch (error) {
      next(error);
    }
  };
};

export default validator;
