import { NextFunction, Request, Response } from "express";
import formidable from "formidable";

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
