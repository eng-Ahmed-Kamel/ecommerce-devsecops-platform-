import { User_model } from "../user/user.model.js";
import Product from "../products/product.model.js";
import { Rate } from "./rating.model.js";

const createRating = async (req, res, next) => {
  const PID = req.params.productId;
  const UID = req.user.id;

  if (!PID || !UID) {
    return res.status(400).json({
      status: "fail",
      message: "Product ID and User ID are required",
    });
  }

  const { comment, rating } = req.body;

  const product = await Product.findById(PID).select("_id name");
  if (!product) {
    return res.status(404).json({
      status: "fail",
      message: "Product not found",
    });
  }

  const user = await User_model.findById(UID).select("_id name");
  if (!user) {
    return res.status(404).json({
      status: "fail",
      message: "User not found",
    });
  }

  const existing = await Rate.findOne({ productId: PID, userId: UID });
  if (existing) {
    return res
      .status(400)
      .json({ status: "fail", message: "You already rated this product" });
  }
  console.log("PID:", PID, "UID:", UID, "Body:", req.body);
  const newRating = await Rate.create({
    productId: PID,
    userId: UID,
    comment,
    rating,
  });
  console.log("newRating", newRating);

  const populatedRating = await Rate.findById(newRating._id)
    .populate("productId", "name")
    .populate("userId", "name");

  return res.status(201).json({
    status: "success",
    data: {
      rating: populatedRating,
    },
  });
};

const getAllProductRatings = async (req, res, next) => {
  const PID = req.params.productId;

  const product = await Product.findById(PID);

  if (!product) {
    return res.status(404).json({
      status: "fail",
      message: "There is no product with this Product ID",
    });
  }

  const ratings = await Rate.find({ productId: PID })
    .populate("userId", "name")
    .select("rating comment createdAt");

  return res.status(200).json({
    status: "success",
    data: {
      product: {
        _id: product._id,
        name: product.name,
        ratings: ratings,
      },
    },
  });
};

const updateRating = async (req, res) => {
  const ratingId = req.params.ratingId;
  const updates = req.body;

  const updatedRating = await Rate.findOneAndUpdate(
    {
      _id: ratingId,
      userId: req.user._id, 
    },
    updates,
    { new: true, runValidators: true }
  )
    .populate("userId", "name")
    .select("rating comment createdAt");

  if (!updatedRating) {
    return res.status(404).json({
      status: "fail",
      message: "Rating not found or you are not allowed to edit it",
    });
  }

  res.status(200).json({
    status: "success",
    data: updatedRating,
  });
};

const deleteRating = async (req, res) => {
  const ratingId = req.params.ratingId;

  const deletedRating = await Rate.findOneAndDelete({
    _id: ratingId,
    userId: req.user._id, 
  });

  if (!deletedRating) {
    return res.status(404).json({
      status: "fail",
      message: "Rating not found or you are not allowed to delete it",
    });
  }

  res.status(200).json({
    status: "success",
    data: deletedRating,
  });
};
export { createRating, getAllProductRatings, updateRating, deleteRating };
