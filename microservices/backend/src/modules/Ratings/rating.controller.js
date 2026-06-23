import { Router } from "express";

import { auth } from "../../midleware/auth.middleware.js";
import {
  createRating,
  deleteRating,
  getAllProductRatings,
  updateRating,
} from "./rating.service.js";
import { catchAsync } from "../../midleware/errorHandler.middleware.js";

export const rating_routes = Router();

rating_routes.post("/:productId/ratings", auth,catchAsync(createRating));
rating_routes.get("/:productId/ratings", catchAsync(getAllProductRatings));
rating_routes.patch("/ratings/:ratingId", auth,catchAsync(updateRating));
rating_routes.delete("/ratings/:ratingId",auth, catchAsync(deleteRating));
