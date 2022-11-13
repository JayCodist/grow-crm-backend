import { Schema, model, Document } from "mongoose";
import Logger from "../../core/Logger";

const DOCUMENT_NAME = "User";
const COLLECTION_NAME = "users";

export const userProjection = [
  "id",
  "createdAt",
  "name",
  "phone",
  "email",
  "addresses",
  "city",
  "state",
  "phoneAlt",
  "dob",
  "gender",
  "password"
];

export default interface User {
  id: string;
  name: string;
  addresses: string[];
  password: string;
  gender: string;
  city: string;
  email: string;
  phone: string;
  phoneAlt: string;
  state: string;
  dob: string;
  createdAt: string;
}

export interface LoginResponse extends Omit<User, "password"> {
  authToken: string;
}

export type UserCreate = Partial<User> & { email: string; password: string };

const schema = new Schema(
  {
    _id: String,
    name: String,
    addresses: [String],
    gender: String,
    city: String,
    email: String,
    phone: String,
    phoneAlt: String,
    state: String,
    dob: String,
    password: String
  },
  { _id: false }
).index({
  createdAt: 1
});

export const UserModel = model<Document & User>(
  DOCUMENT_NAME,
  schema,
  COLLECTION_NAME
);

UserModel.on("index", error => {
  if (error) {
    Logger.error(error);
  } else {
    Logger.info(`${DOCUMENT_NAME} index created!`);
  }
});
