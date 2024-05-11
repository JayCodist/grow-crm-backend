import { InternalError } from "../../core/ApiError";
import {
  formatResponseRecord,
  minimizeProduct
} from "../../helpers/formatters";
import { wPCollectionIsReady } from "../../helpers/search-helpers";
import { PartialLoose } from "../../helpers/type-helpers";
import { Business } from "../model/Order";
import {
  Product,
  productProjection,
  productProjectionMinimal
} from "../model/product/model.interface";
import { ProductModelMap } from "./utils";

type SortLogic = PartialLoose<Product, "asc" | "desc">;

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

export default class ProductRepo {
  public static async getPaginatedProducts({
    filter = defaultFilter,
    pageNumber = defaultPageAttr.pageNumber,
    pageSize = defaultPageAttr.pageSize,
    sortLogic = defaultSortLogic,
    business
  }: PaginatedFetchParams): Promise<{ data: Product[]; count: number }> {
    return new Promise((resolve, reject) => {
      wPCollectionIsReady(business).then(() =>
        ProductModelMap[business]
          .find(filter)
          .sort(sortLogic)
          .skip((pageNumber - 1) * pageSize)
          .limit(pageSize)
          .lean<Product[]>()
          .select(productProjection.join(" "))
          .exec((err: Error | null, products: Product[]) => {
            if (err) {
              reject(new InternalError(err.message));
            } else {
              const filterQuery = ProductModelMap[business].find(filter);
              const countQuery =
                filter === defaultFilter
                  ? filterQuery.estimatedDocumentCount()
                  : ProductModelMap[business].countDocuments(filter);
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
  ): Promise<Product | null> {
    const product = await ProductModelMap[business]
      .findOne({ slug })
      .select(productProjection.join(" "))
      .lean<Product>()
      .exec();
    if (!product) {
      return null;
    }
    const relatedProducts = relatedProductsCount
      ? await ProductModelMap[business]
          .find({
            categories: { $in: product.categories }
          })
          .limit(relatedProductsCount + 1)
          .select(productProjectionMinimal.join(" "))
          .lean<Product[]>()
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
  ): Promise<Product[]> {
    return ProductModelMap[business]
      .find({ slug: { $in: slugs } })
      .select(productProjection.join(" "))
      .lean<Product[]>()
      .exec();
  }

  public static findByKeys(
    keys: number[],
    business: Business
  ): Promise<Product[]> {
    return ProductModelMap[business]
      .find({ key: { $in: keys } })
      .select(productProjection.join(" "))
      .lean<Product[]>()
      .exec();
  }

  public static async getAllProducts(business: Business): Promise<{
    data: Product[];
    count: number;
  }> {
    return new Promise((resolve, reject) => {
      wPCollectionIsReady(business).then(() => {
        ProductModelMap[business]
          .find({}, productProjection)
          .lean()
          .exec((err, products: Product[]) => {
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
