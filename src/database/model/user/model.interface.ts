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
