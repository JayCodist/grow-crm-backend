import express from "express";
import allProductWp from "./all";
import featuredProductWp from "./featured";
import productWP from "./paginate";
import productWPSlug from "./product-slug";
import productWPSlugMultiple from "./product-slug-multiple";

const wordpressProductRoutes = express.Router();

wordpressProductRoutes.get("/featured", featuredProductWp);
wordpressProductRoutes.get("/all", allProductWp);
wordpressProductRoutes.get("/paginate", productWP);
wordpressProductRoutes.get("/slug-multiple", productWPSlugMultiple);
wordpressProductRoutes.get("/:slug", productWPSlug);

export default wordpressProductRoutes;
