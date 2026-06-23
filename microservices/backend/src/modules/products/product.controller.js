import { Router } from "express";
import {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleFavorite,
  getFavourites,
  getProductById,
} from "./product.service.js";

import { catchAsync } from "../../midleware/errorHandler.middleware.js";
import { auth } from "../../midleware/auth.middleware.js";
import { restrictTo } from "../../midleware/Authorization.middleware.js";

export const product_routes = Router();


product_routes.get("/getFavourites", auth, catchAsync(getFavourites));
product_routes.patch("/favorites/toggle/:id", auth, catchAsync(toggleFavorite));
product_routes.get("/", getAllProducts);
product_routes.get("/:id", getProductById);
product_routes.post("/", auth, restrictTo("admin"), catchAsync(createProduct));
product_routes.patch(
  "/:id",
  auth,
  restrictTo("admin"),
  catchAsync(updateProduct),
);
product_routes.delete(
  "/:id",
  auth,
  restrictTo("admin"),
  catchAsync(deleteProduct),
);

