import dayjs from "dayjs";
import { PartialLoose } from "../../helpers/type-helpers";
import { BadRequestError, InternalError } from "../../core/ApiError";
import { formatResponseRecord } from "../../helpers/formatters";
import { getSearchArray } from "../../helpers/search-helpers";
import {
  Blog,
  BlogCreate,
  blogProjection
} from "../model/blog/model.interface";
import { BlogModelMap } from "./utils";
import { Business } from "../model/Order";

type SortLogic = PartialLoose<Blog, "asc" | "desc">;
const defaultSortLogic: SortLogic = { createdAt: "asc" };
const defaultPageAttr = {
  pageNumber: 1,
  pageSize: 10
};

export interface PaginatedFetchParams {
  business: Business;
  pageNumber?: number;
  pageSize?: number;
  sortLogic?: SortLogic;
  filter?: Record<string, any>;
  searchStr?: string;
}

export default class BlogRepo {
  public static getPaginatedBlogs({
    filter: _filter,
    pageNumber = defaultPageAttr.pageNumber,
    pageSize = defaultPageAttr.pageSize,
    sortLogic = defaultSortLogic,
    searchStr,
    business
  }: PaginatedFetchParams): Promise<{ data: Blog[]; count: number }> {
    return new Promise((resolve, reject) => {
      const filter = {
        ...(_filter || {}),
        ...(searchStr ? { _blogSearch: searchStr } : {})
      };
      BlogModelMap[business]
        .find(filter)
        .sort(sortLogic)
        .skip((pageNumber - 1) * pageSize)
        .limit(pageSize)
        .lean<Blog[]>()
        .select(blogProjection.join(" "))
        .exec((err: Error | null, blogs: Blog[]) => {
          if (err) {
            reject(new InternalError(err.message));
          } else {
            const filterQuery = BlogModelMap[business].find(filter);
            const countQuery = _filter
              ? filterQuery.estimatedDocumentCount()
              : BlogModelMap[business].countDocuments(filter);
            countQuery.exec((countErr, count) => {
              if (countErr) {
                reject(new InternalError(countErr.message));
              } else {
                resolve({
                  data: blogs.map(formatResponseRecord),
                  count
                });
              }
            });
          }
        });
    });
  }

  public static async create(
    input: Omit<Blog, "id">,
    business: Business
  ): Promise<Blog> {
    const existingBlog = await this.findBySlug(input.slug, business);
    if (existingBlog) {
      throw new BadRequestError("Provided slug is already in use");
    }
    const data: BlogCreate = {
      ...input,
      createdAt: input.createdAt || dayjs().format(),
      lastUpdatedAt: null,
      _blogSearch: [
        ...getSearchArray(input.title),
        ...getSearchArray(input.body)
      ]
    };
    const { createdAt, _id: id } = await BlogModelMap[business].create(data);
    return { ...input, createdAt, id };
  }

  public static async update(updateParams: Partial<Blog>, business: Business) {
    const { id, ...update } = updateParams;
    await BlogModelMap[business].findByIdAndUpdate(
      id,
      { ...update, lastUpdatedAt: dayjs().format() },
      {
        new: true
      }
    );

    return null;
  }

  public static async delete(id: string, business: Business) {
    await BlogModelMap[business].findByIdAndDelete(id);

    return null;
  }

  public static findBySlug(
    slug: string,
    business: Business
  ): Promise<Blog | null> {
    return BlogModelMap[business].findOne({ slug }).lean<Blog>().exec();
  }

  public static findById(id: string, business: Business): Promise<Blog | null> {
    return BlogModelMap[business].findOne({ _id: id }).lean<Blog>().exec();
  }
}