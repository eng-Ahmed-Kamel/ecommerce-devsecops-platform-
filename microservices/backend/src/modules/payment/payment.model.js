import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    stripeCustomerId: {
      type: String,
      required: true,
    },
    stripeChargeId: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: "usd",
    },
    status: {
      type: String,
      enum: ["succeeded", "pending", "failed"],
      default: "pending",
    },
    description: {
      type: String,
      default: "Payment",
    },
  },
  { timestamps: true },
);

export const Payment_model = mongoose.model("Payment", paymentSchema);
