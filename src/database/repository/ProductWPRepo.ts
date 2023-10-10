// type SortLogic =

import { InternalError } from "../../core/ApiError";
import {
  formatResponseRecord,
  minimizeProduct
} from "../../helpers/formatters";
import { wPCollectionIsReady } from "../../helpers/search-helpers";
import { PartialLoose } from "../../helpers/type-helpers";
import { ProductWPRegalModel } from "../model/product-wp/ProductWPRegal";
import {
  ProductWP,
  productWPProjection,
  productWPProjectionMinimal
} from "../model/product-wp/model.interface";

type SortLogic = PartialLoose<ProductWP, "asc" | "desc">;

export interface PaginatedFetchParams {
  pageNumber?: number;
  pageSize?: number;
  sortLogic?: SortLogic;
  filter?: Record<string, any>;
  search?: string;
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
        ProductWPRegalModel.find(filter)
          .sort(sortLogic)
          .skip((pageNumber - 1) * pageSize)
          .limit(pageSize)
          .lean<ProductWP[]>()
          .select(productWPProjection.join(" "))
          .exec((err: Error | null, products: ProductWP[]) => {
            if (err) {
              reject(new InternalError(err.message));
            } else {
              const filterQuery = ProductWPRegalModel.find(filter);
              const countQuery =
                filter === defaultFilter
                  ? filterQuery.estimatedDocumentCount()
                  : ProductWPRegalModel.countDocuments(filter);
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

  public static async findBySlug(
    slug: string,
    relatedProductsCount = 0
  ): Promise<ProductWP | null> {
    const product = await ProductWPRegalModel.findOne({ slug })
      .select(productWPProjection.join(" "))
      .lean<ProductWP>()
      .exec();
    if (!product) {
      return null;
    }
    const relatedProducts = relatedProductsCount
      ? await ProductWPRegalModel.find({
          categories: { $in: product.categories }
        })
          .limit(relatedProductsCount + 1)
          .select(productWPProjectionMinimal.join(" "))
          .lean<ProductWP[]>()
          .exec()
      : null;

    return {
      ...product,
      ...(relatedProducts
        ? {
            relatedProducts: relatedProducts
              .filter(prod => prod.slug !== slug)
              .slice(0, relatedProductsCount)
              .map(minimizeProduct)
          }
        : {})
    };
  }

  public static findBySlugs(slugs: string[]): Promise<ProductWP[]> {
    return ProductWPRegalModel.find({ slug: { $in: slugs } })
      .select(productWPProjection.join(" "))
      .lean<ProductWP[]>()
      .exec();
  }

  public static findByKeys(keys: number[]): Promise<ProductWP[]> {
    return ProductWPRegalModel.find({ key: { $in: keys } })
      .select(productWPProjection.join(" "))
      .lean<ProductWP[]>()
      .exec();
  }

  public static async getAllProducts(): Promise<{
    data: ProductWP[];
    count: number;
  }> {
    return new Promise((resolve, reject) => {
      wPCollectionIsReady().then(() => {
        ProductWPRegalModel.find({}, productWPProjection)
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
