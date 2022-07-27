// type SortLogic =

import { InternalError } from "../../core/ApiError";
import { formatResponseRecord } from "../../helpers/formatters";
import { PartialLoose } from "../../helpers/type-helpers";
import {
  ProductWP,
  ProductWPModel,
  productWPProjection
} from "../model/ProductWP";

export type tag = "regular" | "vip" | "bundled";

type SortLogic = PartialLoose<ProductWP, "asc" | "desc">;

export interface PaginatedFetchParams {
  pageNumber?: number;
  pageSize?: number;
  sortLogic?: SortLogic;
  filter?: Record<string, any>;
  tags?: tag[];
}

const defaultSortLogic: SortLogic = { name: "asc", price: "desc" };
const defaultFilter = {};
const defaultPageAttr = {
  pageNumber: 1,
  pageSize: 10
};
const defaultTags = ["regular", "vip", "bundled"] as tag[];

export default class ProductWPRepo {
  public static async getPaginatedProducts({
    filter = defaultFilter,
    pageNumber = defaultPageAttr.pageNumber,
    pageSize = defaultPageAttr.pageSize,
    sortLogic = defaultSortLogic,
    tags = defaultTags
  }: PaginatedFetchParams): Promise<{ data: ProductWP[]; count: number }> {
    return new Promise((resolve, reject) => {
      ProductWPModel.find(filter)
        .find({ tags: { $in: tags } })
        .sort(sortLogic)
        .skip((pageNumber - 1) * pageSize)
        .limit(pageSize)
        .lean<ProductWP[]>()
        .select(productWPProjection.join(" "))
        .exec((err: Error | null, products: ProductWP[]) => {
          if (err) {
            reject(new InternalError(err.message));
          } else {
            resolve({
              data: products.map(formatResponseRecord),
              count: products.length
            });
          }
        });
    });
  }
}
