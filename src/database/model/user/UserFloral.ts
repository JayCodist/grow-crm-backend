import { Schema, model, Document } from "mongoose";
import Logger from "../../../core/Logger";
import User from "./model.interface";

const DOCUMENT_NAME = "UserFloral";
const COLLECTION_NAME = "usersFloral";

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

export const UserFloralModel = model<Document & User>(
  DOCUMENT_NAME,
  schema,
  COLLECTION_NAME
);

UserFloralModel.on("index", error => {
  if (error) {
    Logger.error(error);
  } else {
    Logger.info(`${DOCUMENT_NAME} index created!`);
  }
});
