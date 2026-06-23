import { Router } from "express";
import {
  addNewCard,
  createCharge,
  createCustomer,
  deleteCard,
  getCards,
} from "./payment.service.js";

import { auth } from "../../midleware/auth.middleware.js";
import { validate } from "../../midleware/validate.middleware.js";
import { addCardSchema, createChargeSchema } from "./payment.validation.js";

export const payment_routes = Router();

payment_routes.post("/create-customer", auth, createCustomer);
payment_routes.post("/add-card", auth, validate(addCardSchema), addNewCard);
payment_routes.post(
  "/create-charge",
  auth,
  validate(createChargeSchema),
  createCharge,
);
payment_routes.get("/cards", auth, getCards);
payment_routes.delete("/cards/:cardId", auth, deleteCard);
