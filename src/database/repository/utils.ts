import { Model } from "mongoose";
import AppConfig from "../model/AppConfig";
import { Business } from "../model/Order";
import { ProductWPFloralModel } from "../model/product-wp/ProductWPFloral";
import { ProductWPRegalModel } from "../model/product-wp/ProductWPRegal";
import { ProductWP } from "../model/product-wp/model.interface";
import CategoryWP from "../model/category-wp/model.interface";
import { CategoryWPRegalModel } from "../model/category-wp/CategoryWPRegal";
import { CategoryWPFloralModel } from "../model/category-wp/CategoryWPFloral";
import User from "../model/user/model.interface";
import { UserRegalModel } from "../model/user/UserRegal";
import { UserFloralModel } from "../model/user/UserFloral";

export const appConfigSyncProgressFieldMap: Record<Business, keyof AppConfig> =
  {
    regalFlowers: "wPSyncInProgressRegal",
    floralHub: "wPSyncInProgressFloral"
  };

export const appConfigTotalSyncsFieldMap: Record<Business, keyof AppConfig> = {
  regalFlowers: "wPTotalSyncsRegal",
  floralHub: "wPTotalSyncsFloral"
};

export const appConfigSyncDateFieldMap: Record<Business, keyof AppConfig> = {
  regalFlowers: "lastWPSyncDateRegal",
  floralHub: "lastWPSyncDateFloral"
};

export const ProductModelMap: Record<Business, Model<ProductWP>> = {
  regalFlowers: ProductWPRegalModel,
  floralHub: ProductWPFloralModel
};

export const CategoryModelMap: Record<Business, Model<CategoryWP>> = {
  regalFlowers: CategoryWPRegalModel as Model<CategoryWP>,
  floralHub: CategoryWPFloralModel as Model<CategoryWP>
};

export const UserModelMap: Record<Business, Model<User>> = {
  regalFlowers: UserRegalModel,
  floralHub: UserFloralModel
};

export const businessPaystackScret: Record<Business, string> = {
  floralHub: process.env.FLORAL_HUB_PAYSTACK_SECRET_KEY as string,
  regalFlowers: process.env.REGAL_FLOWERS_PAYSTACK_SECRET_KEY as string
};

export const businessOrderPathMap: Record<Business, string> = {
  floralHub: "floral-order",
  regalFlowers: "order"
};

export const businessNewOrderPathMap: Record<Business, string> = {
  floralHub: "new-floral-order",
  regalFlowers: "new-order"
};

export const businessEmailMap: Record<Business, string> = {
  floralHub: "info@floralhub.com.ng",
  regalFlowers: "info@regalflowers.com.ng"
};

export const businessTemplateIdMap: Record<Business, string> = {
  floralHub: "5369366",
  regalFlowers: "5055243"
};

export const businessProdUrlMap: Record<Business, string> = {
  floralHub: "https://floralhub.com.ng",
  regalFlowers: "https://regalflowers.com.ng"
};
