import { z } from "zod";

const promoCodeSchema = z.object({
  code: z.string().min(3).max(20).toUpperCase(),
  discountType: z.enum(["percentage", "fixed"]),
  discountValue: z.number().positive(),
  maxUses: z.number().int().positive().default(1),
  expiresAt: z.coerce.date().optional(),
  isActive: z.boolean().default(true),
});

const validatePromoCode = (req, res, next) => {
  const result = promoCodeSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      success: false,
      data: { message: result.error.issues.map((e) => e.message).join(", ") },
    });
  }

  req.body = result.data;
  next();
};

export { validatePromoCode };
