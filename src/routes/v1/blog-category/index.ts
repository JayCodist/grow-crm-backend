import express from "express";
import blogCategoryId from "./blog-category-id";
import blogCategoryName from "./blog-category-name";
import { handleFirebaseAuthValidation } from "../../../helpers/request-modifiers";
import blogCategoryCreate from "./create";
import blogCategoryUpdate from "./update";
import blogCategoryDelete from "./delete";

const blogCategoryRoutes = express.Router();
blogCategoryRoutes.use("/id", blogCategoryId);
blogCategoryRoutes.use("/name", blogCategoryName);

blogCategoryRoutes.use(
  "/admin/create",
  handleFirebaseAuthValidation(),
  blogCategoryCreate
);
blogCategoryRoutes.use(
  "/admin/update",
  handleFirebaseAuthValidation(),
  blogCategoryUpdate
);
blogCategoryRoutes.use(
  "/admin/delete",
  handleFirebaseAuthValidation(),
  blogCategoryDelete
);
export default blogCategoryRoutes;
