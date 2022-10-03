// type SortLogic =

import { InternalError } from "../../core/ApiError";
import { formatResponseRecord } from "../../helpers/formatters";
import { wPCollectionIsReady } from "../../helpers/search-helpers";
import { PartialLoose } from "../../helpers/type-helpers";
import {
  ProductWP,
  ProductWPModel,
  productWPProjection
} from "../model/ProductWP";

type SortLogic = PartialLoose<ProductWP, "asc" | "desc">;

export interface PaginatedFetchParams {
  pageNumber?: number;
  pageSize?: number;
  sortLogic?: SortLogic;
  filter?: Record<string, any>;
}

const defaultSortLogic: SortLogic = { name: "asc", price: "desc" };
const defaultFilter = {};
const defaultPageAttr = {
  pageNumber: 1,
  pageSize: 10
};

export default class ProductWPRepo {
  public static async getPaginatedProducts({
    filter = defaultFilter,
    pageNumber = defaultPageAttr.pageNumber,
    pageSize = defaultPageAttr.pageSize,
    sortLogic = defaultSortLogic
  }: PaginatedFetchParams): Promise<{ data: ProductWP[]; count: number }> {
    return new Promise((resolve, reject) => {
      wPCollectionIsReady().then(() =>
        ProductWPModel.find(filter)
          .sort(sortLogic)
          .skip((pageNumber - 1) * pageSize)
          .limit(pageSize)
          .lean<ProductWP[]>()
          .select(productWPProjection.join(" "))
          .exec((err: Error | null, products: ProductWP[]) => {
            if (err) {
              reject(new InternalError(err.message));
            } else {
              const filterQuery = ProductWPModel.find(filter);
              const countQuery =
                filter === defaultFilter
                  ? filterQuery.estimatedDocumentCount()
                  : ProductWPModel.countDocuments(filter);
              countQuery.exec((countErr, count) => {
                if (countErr) {
                  reject(new InternalError(countErr.message));
                } else {
                  resolve({
                    data: products.map(formatResponseRecord),
                    count
                  });
                }
              });
            }
          })
      );
    });
  }

  public static findBySlug(slug: string): Promise<ProductWP | null> {
    return ProductWPModel.findOne({ slug }).lean<ProductWP>().exec();
  }

  public static async getAllProducts(): Promise<{
    data: ProductWP[];
    count: number;
  }> {
    return new Promise((resolve, reject) => {
      wPCollectionIsReady().then(() => {
        ProductWPModel.find({}, productWPProjection)
          .lean()
          .exec((err, products: ProductWP[]) => {
            if (err) {
              reject(err);
            } else {
              resolve({
                data: products.map(formatResponseRecord),
                count: products.length
              });
            }
          });
      });
    });
  }
}
