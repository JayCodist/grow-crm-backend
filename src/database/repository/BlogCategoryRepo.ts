import { BadRequestError } from "../../core/ApiError";
import { Business } from "../model/Order";
import { BlogCategory } from "../model/blog-category/model.interface";
import BlogRepo from "./BlogRepo";
import { BlogCategoryModelMap, BlogModelMap } from "./utils";

export default class BlogCategoryRepo {
  public static getCategories(business: Business): Promise<BlogCategory[]> {
    return BlogCategoryModelMap[business].find().lean<BlogCategory[]>().exec();
  }

  public static async create(
    input: Omit<BlogCategory, "id">,
    business: Business
  ): Promise<BlogCategory> {
    const existingBlogCategory = await this.findByName(input.name, business);
    if (existingBlogCategory) {
      throw new BadRequestError("Category already created");
    }
    const { _id: id } = await BlogCategoryModelMap[business].create(input);
    return { ...input, id };
  }

  public static findByName(
    name: string,
    business: Business
  ): Promise<BlogCategory | null> {
    return BlogCategoryModelMap[business]
      .findOne({ name })
      .lean<BlogCategory>()
      .exec();
  }

  public static findById(
    id: string,
    business: Business
  ): Promise<BlogCategory | null> {
    return BlogCategoryModelMap[business]
      .findOne({ _id: id })
      .lean<BlogCategory>()
      .exec();
  }

  public static async update(
    updateParams: Partial<BlogCategory>,
    business: Business
  ) {
    const { id, ...update } = updateParams;

    await BlogCategoryModelMap[business].findByIdAndUpdate(
      id,
      { ...update },
      {
        new: true
      }
    );

    return null;
  }

  public static async delete(id: string, business: Business) {
    await BlogRepo.deleteCategory(id, business);
    await BlogCategoryModelMap[business].findByIdAndDelete(id);

    return null;
  }
}
