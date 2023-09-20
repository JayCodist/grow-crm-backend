import express from "express";
import { ApiError } from "../../../../core/ApiError";
import { SuccessResponse } from "../../../../core/ApiResponse";
import ProductWPRepo from "../../../../database/repository/ProductWPRepo";
import validator from "../../../../helpers/validator";
import validation from "./validation";

const productWP = express.Router();

const createArray = (value: string) => {
  return String(value || "")
    .trim()
    .split(",")
    .map(item => item.trim())
    .filter(Boolean);
};

productWP.use(
  "/",
  validator(validation.paginate, "query"),
  async (req, res) => {
    try {
      const {
        pageNumber,
        pageSize,
        sortField,
        sortType,
        categories,
        productClass,
        budget,
        flowerType,
        design,
        packages,
        delivery,
        flowerName,
        search
      } = req.query;

      const categoryArr = String(categories || "")
        .trim()
        .split(",")
        .map(item => item.trim())
        .filter(Boolean);

      const budgetArr = createArray(String(budget || ""));
      const flowerTypeArr = createArray(String(flowerType || ""));
      const designArr = createArray(String(design || ""));
      const packagesArr = createArray(String(packages || ""));
      const deliveryArr = createArray(String(delivery || ""));
      const flowerNameArr = createArray(String(flowerName || ""));

      const categoryProps = categoryArr.length
        ? {
            categories: {
              $in: categoryArr
            }
          }
        : {};

      const budgetProps = budgetArr.length
        ? { "tags.budget": { $in: budgetArr } }
        : {};

      const flowerNameProps = flowerNameArr.length
        ? { "tags.flowerName": { $in: flowerNameArr } }
        : {};

      const designProps = designArr.length
        ? { "tags.design": { $in: designArr } }
        : {};

      const packagesProps = packagesArr.length
        ? { "tags.packages": { $in: packagesArr } }
        : {};

      const deliveryProps = deliveryArr.length
        ? { "tags.delivery": { $in: deliveryArr } }
        : {};

      const flowerTypeProps = flowerTypeArr.length
        ? { "tags.flowerType": { $in: flowerTypeArr } }
        : {};

      const classProps = productClass ? { class: productClass } : {};

      const response = await ProductWPRepo.getPaginatedProducts({
        sortLogic:
          sortField && sortType
            ? {
                [sortField as string]: sortType
              }
            : undefined,
        pageSize: Number(pageSize) || undefined,
        pageNumber: Number(pageNumber) || undefined,
        filter: {
          ...categoryProps,
          ...classProps,
          ...budgetProps,
          ...flowerNameProps,
          ...designProps,
          ...packagesProps,
          ...deliveryProps,
          ...flowerTypeProps
        },
        search: String(search || "")
      });

      const data = response.data.filter(product => product.inStock);

      new SuccessResponse("success", { ...response, data }).send(res);
    } catch (error) {
      ApiError.handle(error as Error, res);
    }
  }
);

export default productWP;
