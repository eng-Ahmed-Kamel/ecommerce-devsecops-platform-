import { z } from "zod";

export const addCardSchema = z.object({
  card_token: z
    .string({ required_error: "card_token is required" })
    .min(1, "card_token cannot be empty"),
});

export const createChargeSchema = z.object({
  amount: z
    .number({
      required_error: "amount is required",
      invalid_type_error: "amount must be a number",
    })
    .positive("amount must be a positive number"),
  currency: z.string().optional().default("usd"),
  description: z.string().optional().default("Payment"),
});
