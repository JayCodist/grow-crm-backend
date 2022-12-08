import express from "express";
import allProductWp from "./all";
import productWP from "./paginate";
import productWPSlug from "./product-slug";
import productWPSlugMultiple from "./product-slug-multiple";

const wordpressProductRoutes = express.Router();

wordpressProductRoutes.get("/all", allProductWp);
wordpressProductRoutes.get("/paginate", productWP);
wordpressProductRoutes.get("/slug-multiple", productWPSlugMultiple);
wordpressProductRoutes.use("/single", productWPSlug);

export default wordpressProductRoutes;
