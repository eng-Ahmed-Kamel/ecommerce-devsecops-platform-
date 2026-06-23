import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      default: null, // null = guest order
    },
    products: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: { type: Number, default: 1 },
        price: { type: Number, required: true }, // snapshot price at order time
      },
    ],
    totalAmount: { type: Number, required: true },
    discount: { type: Number, default: 0 }, // ← added
    promoCode: { type: String, default: null }, // ← added
    status: {
      type: String,
      enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
    paymentMethod: {
      type: String,
      enum: ["cash", "card"],
      required: true,
    },
    shippingAddress: {
      governorate: { type: String, required: true },
      city: { type: String, required: true },
      street: { type: String, required: true },
    },
    // For guest orders
    guestInfo: {
      name: { type: String },
      email: { type: String },
      phone: { type: String },
    },
  },
  { timestamps: true },
);

const Order = mongoose.model("Order", orderSchema);
export default Order;
