import { InternalError } from "../../core/ApiError";
import {
  formatResponseRecord,
  minimizeProduct
} from "../../helpers/formatters";
import { wPCollectionIsReady } from "../../helpers/search-helpers";
import { PartialLoose } from "../../helpers/type-helpers";
import { Business } from "../model/Order";
import {
  ProductWP,
  productWPProjection,
  productWPProjectionMinimal
} from "../model/product-wp/model.interface";
import { ProductWPModelMap } from "./utils";

type SortLogic = PartialLoose<ProductWP, "asc" | "desc">;

export interface PaginatedFetchParams {
  business: Business;
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
    sortLogic = defaultSortLogic,
    business
  }: PaginatedFetchParams): Promise<{ data: ProductWP[]; count: number }> {
    return new Promise((resolve, reject) => {
      wPCollectionIsReady(business).then(() =>
        ProductWPModelMap[business]
          .find(filter)
          .sort(sortLogic)
          .skip((pageNumber - 1) * pageSize)
          .limit(pageSize)
          .lean<ProductWP[]>()
          .select(productWPProjection.join(" "))
          .exec((err: Error | null, products: ProductWP[]) => {
            if (err) {
              reject(new InternalError(err.message));
            } else {
              const filterQuery = ProductWPModelMap[business].find(filter);
              const countQuery =
                filter === defaultFilter
                  ? filterQuery.estimatedDocumentCount()
                  : ProductWPModelMap[business].countDocuments(filter);
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
    business: Business,
    relatedProductsCount = 0
  ): Promise<ProductWP | null> {
    const product = await ProductWPModelMap[business]
      .findOne({ slug })
      .select(productWPProjection.join(" "))
      .lean<ProductWP>()
      .exec();
    if (!product) {
      return null;
    }
    const relatedProducts = relatedProductsCount
      ? await ProductWPModelMap[business]
          .find({
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

  public static findBySlugs(
    slugs: string[],
    business: Business
  ): Promise<ProductWP[]> {
    return ProductWPModelMap[business]
      .find({ slug: { $in: slugs } })
      .select(productWPProjection.join(" "))
      .lean<ProductWP[]>()
      .exec();
  }

  public static findByKeys(
    keys: number[],
    business: Business
  ): Promise<ProductWP[]> {
    return ProductWPModelMap[business]
      .find({ key: { $in: keys } })
      .select(productWPProjection.join(" "))
      .lean<ProductWP[]>()
      .exec();
  }

  public static async getAllProducts(business: Business): Promise<{
    data: ProductWP[];
    count: number;
  }> {
    return new Promise((resolve, reject) => {
      wPCollectionIsReady(business).then(() => {
        ProductWPModelMap[business]
          .find({}, productWPProjection)
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
