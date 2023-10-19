import dayjs from "dayjs";
import bcrypt from "bcrypt";
import { PartialLoose } from "../../helpers/type-helpers";
import { AuthFailureError, BadRequestError } from "../../core/ApiError";
import {
  formatPhoneNumber,
  getLoginResponse,
  hashPassword
} from "../../helpers/formatters";
import User, { LoginResponse, UserCreate } from "../model/user/model.interface";
import { Business } from "../model/Order";
import { UserModelMap } from "./utils";

export default class UsersRepo {
  public static async signup(userData: UserCreate, business: Business) {
    const password = await hashPassword(userData.password as string);
    const user = await this.createUser({ ...userData, password }, business);
    return getLoginResponse(user);
  }

  public static async login(
    email: string,
    password: string,
    business: Business
  ): Promise<LoginResponse> {
    const user = await UserModelMap[business]
      .findOne({ email })
      .lean<User>()
      .exec();
    if (!user) {
      throw new AuthFailureError("Credentials entered are not valid");
    }
    const passwordWorks = await bcrypt.compare(password, user.password);
    if (!passwordWorks) {
      throw new AuthFailureError("Credentials entered are not valid");
    }
    return getLoginResponse(user);
  }

  public static async createUser(
    input: UserCreate,
    business: Business
  ): Promise<User> {
    const existingUser = await UserModelMap[business]
      .findOne({ email: input.email })
      .lean<User>()
      .exec();
    if (existingUser) {
      throw new BadRequestError("User already exists");
    }
    const data: UserCreate = {
      ...input,
      createdAt: input.createdAt || dayjs().format(),
      name: input.name || "",
      recipients: input.recipients || [],
      gender: input.gender || "",
      city: input.city || "",
      phone: formatPhoneNumber(input.phone || ""),
      phoneAlt: formatPhoneNumber(input.phoneAlt || ""),
      state: input.state || "",
      dob: input.dob || ""
    };
    const { _id } = await UserModelMap[business].create(data);
    return { ...data, id: _id } as User;
  }

  public static async update(
    updateParams: PartialLoose<User> & { id: string },
    business: Business
  ) {
    const { id, ...update } = updateParams;
    const passwordProps = update.password
      ? { password: await hashPassword(update.password) }
      : {};
    const user = await UserModelMap[business].findByIdAndUpdate(
      id,
      { ...update, ...passwordProps },
      {
        new: true
      }
    );

    return getLoginResponse(user);
  }

  public static async delete(id: string, business: Business) {
    const response = await UserModelMap[business].findByIdAndDelete(id);

    return response;
  }

  public static async findById(
    id: string,
    business: Business
  ): Promise<LoginResponse | null> {
    const doc = await UserModelMap[business]
      .findOne({ _id: id })
      .lean<User>()
      .exec();
    return doc ? getLoginResponse(doc) : null;
  }

  public static async findByEmail(
    email: string,
    business: Business
  ): Promise<LoginResponse | null> {
    const doc = await UserModelMap[business]
      .findOne({ email })
      .lean<User>()
      .exec();
    return doc ? getLoginResponse(doc) : null;
  }
}
