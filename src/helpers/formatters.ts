import bcrypt from "bcrypt";

export const formatResponseRecord: (record: any) => any = record => {
  const { _id, ...rest } = record;
  return { id: _id, ...rest };
};

export const hashPassword: (password: string) => Promise<string> =
  async password => {
    const salt = await bcrypt.genSalt(11);
    const hashedPassword = await bcrypt.hash(password as string, salt);
    return hashedPassword;
  };
