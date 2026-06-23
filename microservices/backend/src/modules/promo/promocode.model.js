import mongoose from "mongoose";
const promoCodeSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, "Promo code is required."],
      uppercase: true,
      trim: true,
    },
    discountType: {
      type: String,
      enum: {
        values: ["percentage", "fixed"],
        message: "Discount type must be either 'percentage' or 'fixed'.",
      },
      required: [true, "Discount type is required."],
    },
    discountValue: {
      type: Number,
      required: [true, "Discount value is required."],
      min: [0, "Discount value must be a positive number."],
    },
    maxUses: {
      type: Number,
      default: 1,
      min: [1, "Max uses must be at least 1."],
    },
    usedCount: {
      type: Number,
      default: 0,
      min: [0, "Used count cannot be negative."],
    },
    expiresAt: {
      type: Date,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

export default mongoose.model("PromoCode", promoCodeSchema);
