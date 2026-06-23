import { Router } from "express";

import { catchAsync } from "../../midleware/errorHandler.middleware.js";
import {
  add_product,
  apply_promo,
  get_cart,
  quantity_adjustment,
  remove_product,
} from "./cart.service.js";
import { auth } from "../../midleware/auth.middleware.js";

export const cart_routes = Router();
cart_routes.get("/", auth, catchAsync(get_cart));
cart_routes.post("/add", auth, catchAsync(add_product));
cart_routes.delete("/remove/:productId", auth, catchAsync(remove_product));
cart_routes.patch(
  "/quantity_adjustment/:productId",
  auth,
  catchAsync(quantity_adjustment),
);
cart_routes.post("/apply-promo", auth, catchAsync(apply_promo));
