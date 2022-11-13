import dayjs from "dayjs";
import User, { UserCreate, UserModel } from "../model/User";
import { PartialLoose } from "../../helpers/type-helpers";

export default class UsersRepo {
  public static async createUser(input: UserCreate): Promise<User> {
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

  public static async update(updateParams: PartialLoose<User>) {
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

  public static findByEmail(email: string): Promise<User | null> {
    return UserModel.findOne({ email }).lean<User>().exec();
  }
}
