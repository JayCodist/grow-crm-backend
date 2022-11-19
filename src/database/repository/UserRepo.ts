import dayjs from "dayjs";
import User, { LoginResponse, UserCreate, UserModel } from "../model/User";
import { PartialLoose } from "../../helpers/type-helpers";
import { BadRequestError } from "../../core/ApiError";

export default class UsersRepo {
  public static async createUser(input: UserCreate): Promise<User> {
    const existingUser = await UserModel.findOne({ email: input.email })
      .lean<User>()
      .exec();
    if (existingUser) {
      throw new BadRequestError("User already exists");
    }
    const data: UserCreate = {
      ...input,
      createdAt: input.createdAt || dayjs().format(),
      name: input.name || "",
      addresses: input.addresses || [],
      gender: input.gender || "",
      city: input.city || "",
      phone: input.phone || "",
      phoneAlt: input.phoneAlt || "",
      state: input.state || "",
      dob: input.dob || ""
    };
    const { _id } = await UserModel.create(data);
    return { ...data, id: _id } as User;
  }

  public static async update(updateParams: PartialLoose<LoginResponse>) {
    const { id, ...update } = updateParams;
    const user = await UserModel.findByIdAndUpdate(id, update, {
      new: true
    });

    return user;
  }

  public static async delete(id: string) {
    const user = await UserModel.findByIdAndDelete(id);

    return user;
  }

  public static findById(id: string): Promise<User | null> {
    return UserModel.findOne({ _id: id }).lean<User>().exec();
  }

  public static async findByEmail(email: string): Promise<User | null> {
    const doc = await UserModel.findOne({ email }).lean<User>().exec();
    if (!doc) {
      return null;
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { _id, __v, ...user } = doc as any;
    return { ...user, id: _id };
  }
}
