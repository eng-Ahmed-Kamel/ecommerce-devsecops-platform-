import mongoose from "mongoose";

export const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { 
  type: String, 
  required: function() {
    return this.provider === 'system'; 
  }
},
    stripeCustomerId: {
      type: String,
      default: null,
    },
    role: { type: String, default: "user" },
    isVerified: { type: Boolean, default: false },
    phone: { type: Number },
    otp: { type: String },
    otpExpiry: { type: Date },
    provider: {
      type: String,
      enum: ["system", "google"],
      default: "system",
    },
    Address:{ type: String, default: null },
    favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
    isblocked:{ type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

export const User_model = mongoose.model("User", userSchema);


