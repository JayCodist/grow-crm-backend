import { Model } from "mongoose";
import AppConfig from "../model/AppConfig";
import { Business } from "../model/Order";
import { ProductWPFloralModel } from "../model/product-wp/ProductWPFloral";
import { ProductWPRegalModel } from "../model/product-wp/ProductWPRegal";
import { ProductWP } from "../model/product-wp/model.interface";
import CategoryWP from "../model/category-wp/model.interface";
import { CategoryWPRegalModel } from "../model/category-wp/CategoryWPRegal";
import { CategoryWPFloralModel } from "../model/category-wp/CategoryWPFloral";

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
