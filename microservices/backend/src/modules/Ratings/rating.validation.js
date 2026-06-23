import z from "zod";

const ratingValidation = z.object({
  comment: z.string().min(2, "Comment must be at least 2 characters"),

  rating: z.number().min(1).max(5),

  productId: z.string().min(1, "Product ID is required"),

  userId: z.string().min(1, "User ID is required"),
});

export default ratingValidation;
