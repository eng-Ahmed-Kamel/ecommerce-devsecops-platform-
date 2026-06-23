import { Router } from "express";

import { validatePromoCode } from "./promocode.validation.js";
import {
  applyPromoCode,
  createPromoCode,
  deletePromoCode,
  getAllPromoCodes,
  getPromoCodeByID,
  updatePromoCode,
} from "./promocode.service.js";

export const promo_router = Router();

promo_router.post("/", validatePromoCode, createPromoCode);
promo_router.get("/", getAllPromoCodes);

promo_router.get("/:id", getPromoCodeByID);
promo_router.patch("/:id", validatePromoCode, updatePromoCode);

promo_router.delete("/:id", deletePromoCode);

promo_router.post("/apply", applyPromoCode);
