import mongoose from "mongoose";

const categorySchema = mongoose.Schema(
  {
    category_name: {
      type: String,
      required: true,
    },
    category_description: {
      type: String,
      required: true,
    },
    image: { type: String, default: "" },
  },
  {
    timestamps: true,
  },
);

export const Category = mongoose.model("Category", categorySchema);
