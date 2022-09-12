import dayjs from "dayjs";
import CategoryWP, {
  CategoryWPModel,
  categoryWPProjection,
  CategoryWPCreate
} from "../model/CategoryWP";
import { PartialLoose } from "../../helpers/type-helpers";
import { PaginatedFetchParams } from "./ClientAccessLogRepo";
import { InternalError } from "../../core/ApiError";
import { formatResponseRecord } from "../../helpers/formatters";
import { getSearchArray } from "../../helpers/search-helpers";

type SortLogic = PartialLoose<CategoryWP, "asc" | "desc">;
const defaultSortLogic: SortLogic = { createdAt: "asc" };
const defaultPageAttr = {
  pageNumber: 1,
  pageSize: 10
};

const defaultFilter = {};

export default class CategoryWPRepo {
  public static getPaginatedCategoryWPs({
    filter = defaultFilter,
    pageNumber = defaultPageAttr.pageNumber,
    pageSize = defaultPageAttr.pageSize,
    sortLogic = defaultSortLogic
  }: PaginatedFetchParams): Promise<{ data: CategoryWP[]; count: number }> {
    return new Promise((resolve, reject) => {
      CategoryWPModel.find(filter)
        .sort(sortLogic)
        .skip((pageNumber - 1) * pageSize)
        .limit(pageSize)
        .lean<CategoryWP[]>()
        .select(categoryWPProjection.join(" "))
        .exec((err: Error | null, categoryWPs: CategoryWP[]) => {
          if (err) {
            reject(new InternalError(err.message));
          } else {
            const filterQuery = CategoryWPModel.find(filter);
            const countQuery =
              filter === defaultFilter
                ? filterQuery.estimatedDocumentCount()
                : CategoryWPModel.countDocuments(filter);
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
        });
    });
  }

  public static async create(input: CategoryWP): Promise<CategoryWP> {
    const { id } = input;
    const data: CategoryWPCreate = {
      ...input,
      _id: id,
      createdAt: input.createdAt || dayjs().format(),
      _nameSearch: getSearchArray(input.name)
    };
    const { createdAt } = await CategoryWPModel.create(data);
    return { ...input, createdAt };
  }

  public static async update(updateParams: PartialLoose<CategoryWP>) {
    const { id, ...update } = updateParams;
    const categoryWP = await CategoryWPModel.findByIdAndUpdate(id, update, {
      new: true
    });

    return categoryWP;
  }

  public static async delete(id: string) {
    const categoryWP = await CategoryWPModel.findByIdAndDelete(id);

    return categoryWP;
  }

  public static findById(id: string): Promise<CategoryWP | null> {
    return CategoryWPModel.findOne({ _id: id }).lean<CategoryWP>().exec();
  }
}
