import { z } from "zod";

const categoryValidation = z.object({
  category_name: z
    .string()
    .min(2, "Category name should have at least 2 characters"),

  category_description: z
    .string()
    .min(10, "Category description should have at least 10 characters"),
});

export default categoryValidation;
