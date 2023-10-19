import { NextFunction, Request, Response } from "express";
import formidable from "formidable";
import { BadTokenError } from "../core/ApiError";
import User from "../database/model/user/model.interface";
import { decodeToken } from "./formatters";

export const handleFormDataParsing = () => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (Object.keys(req.body).length === 0) {
        const form = formidable();
        form.parse(req, (err, fields, files) => {
          if (!err) {
            req.body = {
              ...fields,
              ...files
            };
            next();
          }
          next();
        });
      } else {
        next();
      }
    } catch (error) {
      next();
    }
  };
};

export const handleAuthValidation = (allowAbsentTokens = false) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authToken = (req.headers.authorization || "").replace(
        /^bearer /i,
        ""
      );
      req.user = decodeToken<User>(authToken, allowAbsentTokens);
      if (!allowAbsentTokens && !req.user?.id) {
        throw new BadTokenError("Provided authentication token is invalid");
      }
      next();
    } catch (err) {
      next(
        allowAbsentTokens
          ? null
          : new BadTokenError("Provided authentication token is invalid")
      );
    }
  };
};
