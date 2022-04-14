import express from "express";
import { ApiError, InternalError } from "../../../core/ApiError";
import { SuccessResponse } from "../../../core/ApiResponse";
import ContactsRepo from "../../../database/repository/ContactRepo";
import validator from "../../../helpers/validator";
import validation from "./validation";

const contactLoglist = express.Router();

const getSearchKey = (str: string) => `_${str}Search`;

contactLoglist.get(
  "/paginate",
  validator(validation.paginate, "query"),
  async (req, res) => {
    try {
      const {
        pageNumber,
        pageSize,
        sortField,
        sortType,
        searchField,
        searchValue
      } = req.query;

      const data = await ContactsRepo.getPaginatedContacts({
        sortLogic:
          sortField && sortType
            ? {
                [sortField as string]: sortType
              }
            : undefined,
        pageSize: Number(pageSize) || undefined,
        pageNumber: Number(pageNumber) || undefined,
        filter:
          searchValue && searchField
            ? {
                [getSearchKey(String(searchField))]:
                  String(searchValue).toLowerCase()
              }
            : undefined
      });

      new SuccessResponse("success", data).send(res);
    } catch (error) {
      ApiError.handle(new InternalError("Failed to fetch contacts."), res);
    }
  }
);

export default contactLoglist;
