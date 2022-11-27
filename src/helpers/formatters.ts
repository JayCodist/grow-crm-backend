import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User, { LoginResponse } from "../database/model/User";

export const formatResponseRecord: (record: any) => any = record => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { _id, __v, ...rest } = record;
  return { id: _id, ...rest };
};

export const hashPassword: (password: string) => Promise<string> =
  async password => {
    const salt = await bcrypt.genSalt(11);
    const hashedPassword = await bcrypt.hash(password as string, salt);
    return hashedPassword;
  };

export const getLoginResponse: (user: Partial<User>) => LoginResponse =
  user => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...formattedUser } = formatResponseRecord(user);
    return {
      ...formattedUser,
      authToken: jwt.sign(user, process.env.JWT_SIGNATURE_SECRET as string, {
        expiresIn: "7d"
      })
    } as LoginResponse;
  };
