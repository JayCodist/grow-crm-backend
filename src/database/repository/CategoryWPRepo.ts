import dayjs from "dayjs";
import { PartialLoose } from "../../helpers/type-helpers";
import { InternalError } from "../../core/ApiError";
import { formatResponseRecord } from "../../helpers/formatters";
import {
  getSearchArray,
  wPCollectionIsReady
} from "../../helpers/search-helpers";
import CategoryWP, {
  CategoryWPCreate,
  categoryWPProjection
} from "../model/category-wp/model.interface";
import { Business } from "../model/Order";
import { CategoryModelMap } from "./utils";

type SortLogic = PartialLoose<CategoryWP, "asc" | "desc">;
const defaultSortLogic: SortLogic = { createdAt: "asc" };
const defaultPageAttr = {
  pageNumber: 1,
  pageSize: 10
};

const defaultFilter = {};

export interface PaginatedFetchParams {
  pageNumber?: number;
  pageSize?: number;
  sortLogic?: SortLogic;
  filter?: Record<string, any>;
  business: Business;
}

export default class CategoryWPRepo {
  public static getPaginatedCategoryWPs({
    filter = defaultFilter,
    pageNumber = defaultPageAttr.pageNumber,
    pageSize = defaultPageAttr.pageSize,
    sortLogic = defaultSortLogic,
    business
  }: PaginatedFetchParams): Promise<{ data: CategoryWP[]; count: number }> {
    return new Promise((resolve, reject) => {
      wPCollectionIsReady(business).then(() =>
        CategoryModelMap[business]
          .find(filter)
          .sort(sortLogic)
          .skip((pageNumber - 1) * pageSize)
          .limit(pageSize)
          .lean<CategoryWP[]>()
          .select(categoryWPProjection.join(" "))
          .exec((err: Error | null, categoryWPs: CategoryWP[]) => {
            if (err) {
              reject(new InternalError(err.message));
            } else {
              const filterQuery = CategoryModelMap[business].find(filter);
              const countQuery =
                filter === defaultFilter
                  ? filterQuery.estimatedDocumentCount()
                  : CategoryModelMap[business].countDocuments(filter);
              countQuery.exec((countErr, count) => {
                if (countErr) {
                  reject(new InternalError(countErr.message));
                } else {
                  resolve({
                    data: categoryWPs.map(formatResponseRecord),
                    count
                  });
                }
              });
            }
          })
      );
    });
  }

  public static async create(
    input: CategoryWP,
    business: Business
  ): Promise<CategoryWP> {
    const data: CategoryWPCreate = {
      ...input,
      createdAt: input.createdAt || dayjs().format(),
      _nameSearch: getSearchArray(input.name)
    };
    const { createdAt } = await CategoryModelMap[business].create(data);
    return { ...input, createdAt };
  }

  public static async update(
    updateParams: PartialLoose<CategoryWP>,
    business: Business
  ) {
    const { id, ...update } = updateParams;
    const categoryWP = await CategoryModelMap[business].findByIdAndUpdate(
      id,
      update,
      {
        new: true
      }
    );

    return categoryWP;
  }

  public static async delete(id: string, business: Business) {
    const categoryWP = await CategoryModelMap[business].findByIdAndDelete(id);

    return categoryWP;
  }

  public static findById(
    id: string,
    business: Business
  ): Promise<CategoryWP | null> {
    return CategoryModelMap[business]
      .findOne({ _id: id })
      .lean<CategoryWP>()
      .exec();
  }

  public static async findBySlug(
    slug: string,
    business: Business
  ): Promise<CategoryWP | null> {
    const category = await CategoryModelMap[business]
      .findOne({ slug })
      .select(categoryWPProjection.join(" "))
      .lean<CategoryWP>()
      .exec();

    if (!category) {
      return null;
    }

    return category;
  }
}
