import express from "express";
import blogList from "./paginate";
import blogCreate from "./create";
import blogUpdate from "./update";
import blogDelete from "./delete";
import blogId from "./blog-id";
import blogSlug from "./blog-slug";

const blogRoutes = express.Router();

blogRoutes.use("/paginate", blogList);
blogRoutes.use("/id", blogId);
blogRoutes.use("/slug", blogSlug);

blogRoutes.use("/admin/create", blogCreate);
blogRoutes.use("/admin/update", blogUpdate);
blogRoutes.use("/admin/delete", blogDelete);

export default blogRoutes;
