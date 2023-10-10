import express from "express";
import { ApiError } from "../../../../core/ApiError";
import { SuccessResponse } from "../../../../core/ApiResponse";
import ProductWPRepo from "../../../../database/repository/ProductWPRepo";
import validator from "../../../../helpers/validator";
import validation from "./validation";
import { getSearchKey } from "../../../../helpers/formatters";
import { ProductWP } from "../../../../database/model/ProductWPRegal";

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
        searchValue,
        searchField
      } = req.query;

      let response: { data: ProductWP[]; count: number };
      let responses: any;

      const classProps = productClass ? { class: productClass } : {};

      if (searchValue && searchField) {
        const sortLogic =
          sortField && sortType
            ? {
                [sortField as string]: sortType
              }
            : undefined;

        responses = await Promise.all([
          ProductWPRepo.getPaginatedProducts({
            pageSize: Number(pageSize) || undefined,
            pageNumber: Number(pageNumber) || undefined,
            sortLogic,
            filter: {
              [getSearchKey(String(searchField))]:
                String(searchValue).toLowerCase()
            }
          }),
          ProductWPRepo.getPaginatedProducts({
            pageSize: Number(pageSize) || undefined,
            pageNumber: Number(pageNumber) || undefined,
            sortLogic,
            filter: {
              [getSearchKey(String("category"))]:
                String(searchValue).toLowerCase()
            }
          })
        ]);

        const [searchValueResponse, categoryResponse] = responses;

        const uniqueProducts = [] as ProductWP[];
        const seenKeys = new Set();

        [...searchValueResponse.data, ...categoryResponse.data].forEach(
          item => {
            if (!seenKeys.has(item.key)) {
              seenKeys.add(item.key);
              uniqueProducts.push(item);
            }
          }
        );

        response = {
          data: uniqueProducts,
          count: searchValueResponse.count + categoryResponse.count
        };
      } else {
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

        response = await ProductWPRepo.getPaginatedProducts({
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
          }
        });
      }

      const data = response.data.filter(product => product.inStock);

      new SuccessResponse("success", { data, count: response.count }).send(res);
    } catch (error) {
      ApiError.handle(error as Error, res);
    }
  }
);

export default productWP;
