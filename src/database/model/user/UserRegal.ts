import { Schema, model, Document } from "mongoose";
import Logger from "../../../core/Logger";
import User from "./model.interface";

const DOCUMENT_NAME = "User";
const COLLECTION_NAME = "users";

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

export const UserRegalModel = model<Document & User>(
  DOCUMENT_NAME,
  schema,
  COLLECTION_NAME
);

UserRegalModel.on("index", error => {
  if (error) {
    Logger.error(error);
  }
});
