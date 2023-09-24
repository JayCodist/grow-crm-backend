import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { BadTokenError } from "../core/ApiError";
import { MinimalProductWP, ProductWP } from "../database/model/ProductWP";
import User, { LoginResponse } from "../database/model/User";
import { AppCurrency, AppCurrencyName } from "../database/model/AppConfig";
import { getPriceDisplay } from "./type-conversion";
import { currencyOptions } from "./constants";

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
    const { password, recipients, ...formattedUser } =
      formatResponseRecord(user);
    return {
      ...formattedUser,
      recipients: recipients || [],
      authToken: jwt.sign(
        formattedUser,
        process.env.JWT_SIGNATURE_SECRET as string,
        {
          expiresIn: "7d"
        }
      )
    } as LoginResponse;
  };

export const decodeToken: <T>(token: string, ignoreExpiration: boolean) => T = (
  token,
  ignoreExpiration = false
) => {
  const payload = jwt.verify(
    token,
    process.env.JWT_SIGNATURE_SECRET as string,
    { ignoreExpiration }
  );
  if (typeof payload === "string") {
    throw new BadTokenError("Could not authenticate token");
  }
  delete payload.exp;
  delete payload.iat;
  return payload as any;
};

export const minimizeProduct: (product: ProductWP) => MinimalProductWP =
  product => {
    return {
      name: product.name,
      sku: product.subtitle,
      key: product.key,
      images: product.images[0],
      subtitle: product.subtitle,
      slug: product.slug,
      price: product.price
    };
  };

export const slugify: (str: string) => string = str => {
  return str
    .replace(/(\s|&)+/g, "-")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-");
};

export const formatPhoneNumber = (str: string | undefined) => {
  if (!str || str === "undefined" || typeof str !== "string") return "";
  const output = str
    .replace(/[\s|/]/g, "")
    .replace(/^\+?234\(0\)/, "0")
    .replace(/^\+?2340*/, "0");
  return output;
};

export const extractAmountFromNote = (note: string) => {
  const amountRegex = /([£$]\d+(?:[.,]\d{2})?)/gu;
  return note.match(amountRegex);
};

export const getAdminNoteText = (
  note: string,
  currency: AppCurrencyName,
  totalPrice: number
): string => {
  let adminNotes = note;
  const amount = extractAmountFromNote(note);
  const _currency = currencyOptions.find(
    _currency => _currency.name === currency
  ) as AppCurrency;

  if (amount && _currency?.name !== "NGN") {
    adminNotes = adminNotes.replace(
      amount[0],
      `${getPriceDisplay(totalPrice, _currency)}`
    );
  } else if ((amount || totalPrice) && _currency?.name === "NGN") {
    adminNotes = adminNotes.replace(amount ? amount[0] : "", "");
  } else {
    adminNotes = `${adminNotes} ${
      _currency.name !== "NGN"
        ? getPriceDisplay(parseInt(`${totalPrice}`, 10), _currency)
        : ""
    }`;
  }

  return adminNotes;
};

export const getProductSlug = (permalink: string) =>
  permalink.split("/product").pop()?.replaceAll("/", "").replace(/\?.*$/, "") ||
  "";
