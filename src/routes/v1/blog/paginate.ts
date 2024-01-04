import express from "express";
import { ApiError } from "../../../core/ApiError";
import { SuccessResponse } from "../../../core/ApiResponse";
import BlogRepo from "../../../database/repository/BlogRepo";
import validator from "../../../helpers/validator";
import validation from "./validation";
import { Business } from "../../../database/model/Order";

const blogList = express.Router();

blogList.get(
  "/",
  validator(validation.pagination, "query"),
  async (req, res) => {
    try {
      const { pageNumber, pageSize, sortField, sortType, searchStr, business } =
        req.query;

      const data = await BlogRepo.getPaginatedBlogs({
        sortLogic:
          sortField && sortType
            ? {
                [sortField as string]: sortType
              }
            : undefined,
        pageSize: Number(pageSize) || undefined,
        pageNumber: Number(pageNumber) || undefined,
        searchStr: searchStr as string | undefined,
        business: business as Business
      });
      new SuccessResponse("success", data).send(res);
    } catch (error) {
      ApiError.handle(error as Error, res);
    }
  }
);

export default blogList;
