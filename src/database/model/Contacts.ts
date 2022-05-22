import { Schema, model } from "mongoose";
import Logger from "../../core/Logger";

const DOCUMENT_NAME = "Contacts";
const COLLECTION_NAME = "contacts";

export const contactProjection = [
  "key",
  "createdAt",
  "name",
  "phone",
  "email",
  "address",
  "city",
  "state",
  "phoneAlt",
  "phoneAlt2",
  "dob",
  "firstName",
  "lastName",
  "gender",
  "timestamp",
  "category",
  "phones"
];

export default interface Contact {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  address: string[];
  phones: string[];
  category: string[];
  gender: string;
  city: string;
  email: string;
  phone: string;
  phoneAlt: string;
  phoneAlt2: string;
  state: string;
  dob: string;
  timestamp: string;
  createdAt: string;
}

export interface ContactCreate extends Omit<Contact, "id"> {
  _id: string;
  _categorySearch: string[];
  _nameSearch: string[];
  _phonesSearch: string[];
  _addressSearch: string[];
  _genderSearch: string[];
  _emailSearch: string[];
}

interface ContactDocument extends Document, ContactCreate {}

const schema = new Schema(
  {
    _id: String,
    key: String,
    name: String,
    _nameSearch: { type: [String], index: true },
    firstName: String,
    lastName: String,
    address: [String],
    _addressSearch: { type: [String], index: true },
    phones: [String],
    _phonesSearch: { type: [String], index: true },
    category: [String],
    _categorySearch: { type: [String], index: true },
    gender: String,
    _genderSearch: { type: [String], index: true },
    city: String,
    email: String,
    _emailSearch: { type: [String], index: true },
    phone: String,
    phoneAlt: String,
    phoneAlt2: String,
    state: String,
    dob: String,
    timestamp: String
  },
  { _id: false }
).index({
  createdAt: 1
});

export const ContactModel = model<ContactDocument>(
  DOCUMENT_NAME,
  schema,
  COLLECTION_NAME
);

ContactModel.on("index", error => {
  if (error) {
    Logger.error(error);
  } else {
    Logger.info(`${DOCUMENT_NAME} index created!`);
  }
});
