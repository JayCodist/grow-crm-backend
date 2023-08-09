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
  "recipients",
  "city",
  "state",
  "phoneAlt",
  "dob",
  "gender",
  "password",
  "phoneCountryCode"
];

export interface Recipient {
  name: string;
  address: string;
  phone: string;
  phoneAlt: string;
  residenceType: string;
  message: string;
  method: string;
  state: string;
  despatchLocation: string;
  deliveryLocation: string;
  adminNotes: string;
  phoneCountryCode: string;
  altPhoneCountryCode: string;
}

export default interface User {
  id: string;
  name: string;
  password: string;
  gender: string;
  city: string;
  email: string;
  phone: string;
  phoneAlt: string;
  state: string;
  dob: string;
  createdAt: string;
  recipients: Recipient[];
  phoneCountryCode: string;
  altPhoneCountryCode: string;
}

export interface LoginResponse extends Omit<User, "password"> {
  authToken: string;
}

export type UserCreate = Partial<User> & { email: string; password: string };

const schema = new Schema({
  name: String,
  recipients: [
    {
      name: String,
      address: String,
      phone: String,
      phoneAlt: String,
      residenceType: String,
      message: String,
      method: String,
      state: String,
      pickupLocation: String,
      deliveryLocation: String,
      phoneCountryCode: String,
      altPhoneCountryCode: String
    }
  ],
  gender: String,
  city: String,
  email: String,
  phone: String,
  phoneAlt: String,
  state: String,
  dob: String,
  password: String,
  phoneCountryCode: String
}).index({
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
