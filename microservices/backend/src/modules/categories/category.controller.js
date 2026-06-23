import { Router } from "express";
import {
  createCategory,
  deleteCategory,
  getAllCategories,
  getCategoryByID,
  updateCategory,
} from "./category.service.js";
import { auth } from "../../midleware/auth.middleware.js";
import { restrictTo } from "../../midleware/Authorization.middleware.js";
import { catchAsync } from "../../midleware/errorHandler.middleware.js";

export const category_routes = Router();

// Public routes
category_routes.get("/", catchAsync(getAllCategories));
category_routes.get("/:id",catchAsync( getCategoryByID));

// Admin routes
category_routes.post("/", auth, restrictTo("admin"), catchAsync(createCategory));
category_routes.patch("/:id", auth, restrictTo("admin"), catchAsync(updateCategory));
category_routes.delete("/:id", auth, restrictTo("admin"),catchAsync( deleteCategory));