import { z } from "zod";

const productValidation = z.object({
  name: z.string().min(2, "Product name should have at least 2 characters"),

  description: z
    .string()
    .min(10, "Description should have at least 10 characters"),

  price: z.number().min(0, "Price must be a positive number"),

  categoryId: z.string().min(1, "Category ID is required"),

  stock: z.number().min(0, "Stock cannot be negative").optional(),

  image: z.string().optional(),
});

export default productValidation;
