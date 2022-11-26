import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { AuthFailureError } from "../../core/ApiError";
import { hashPassword } from "../../helpers/formatters";
import User, { LoginResponse, UserCreate } from "../model/User";
import UsersRepo from "./UserRepo";

const getLoginResponse: (user: Partial<User>) => LoginResponse = ({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  password,
  ...user
}) => {
  return {
    ...user,
    authToken: jwt.sign(user, process.env.JWT_SIGNATURE_SECRET as string, {
      expiresIn: "7d"
    })
  } as LoginResponse;
};

export default class AuthRepo {
  public static async signup(userData: UserCreate) {
    const password = await hashPassword(userData.password as string);
    const user = await UsersRepo.createUser({ ...userData, password });
    return getLoginResponse(user);
  }

  public static async login(
    email: string,
    password: string
  ): Promise<LoginResponse> {
    const user = await UsersRepo.findByEmail(email);
    if (!user) {
      throw new AuthFailureError("Credentials entered are not valid");
    }
    const passwordWorks = await bcrypt.compare(password, user.password);
    if (!passwordWorks) {
      throw new AuthFailureError("Credentials entered are not valid");
    }
    return getLoginResponse(user);
  }
}
