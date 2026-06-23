import { catchAsync } from "../../midleware/errorHandler.middleware.js";
import promocodeModel from "./promocode.model.js";
const createPromoCode = catchAsync(async (req, res) => {
  const promo = await promocodeModel.create(req.body);

  return res.status(201).json({
    success: true,
    data: { promo },
  });
});

const getAllPromoCodes = catchAsync(async (req, res) => {
  const promos = await promocodeModel.find({}).select("-__v");

  return res.status(200).json({
    success: true,
    count: promos.length,
    data: { promos },
  });
});

const getPromoCodeByID = catchAsync(async (req, res) => {
  const promo = await promocodeModel.findById(req.params.id).select("-__v");

  if (!promo) {
    return res.status(404).json({
      success: false,
      data: { message: "Promo code not found." },
    });
  }

  return res.status(200).json({
    success: true,
    data: { promo },
  });
});
const updatePromoCode = catchAsync(async (req, res) => {
  const promo = await promocodeModel
    .findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
    .select("-__v");

  if (!promo) {
    return res.status(404).json({
      success: false,
      data: { message: "Promo code not found." },
    });
  }

  return res.status(200).json({
    success: true,
    data: { promo },
  });
});

const deletePromoCode = catchAsync(async (req, res) => {
  const promo = await promocodeModel.findByIdAndDelete(req.params.id);

  if (!promo) {
    return res.status(404).json({
      success: false,
      data: { message: "Promo code not found." },
    });
  }

  return res.status(200).json({
    success: true,
    data: { message: "Promo code deleted successfully." },
  });
});

const applyPromoCode = catchAsync(async (req, res) => {
  const { code } = req.body;

  const promo = await promocodeModel.findOne({ code, isActive: true });

  if (!promo) {
    return res.status(404).json({
      success: false,
      data: { message: "Invalid or inactive promo code." },
    });
  }

  if (promo.expiresAt && promo.expiresAt < new Date()) {
    return res.status(400).json({
      success: false,
      data: { message: "Promo code has expired." },
    });
  }

  if (promo.usedCount >= promo.maxUses) {
    return res.status(400).json({
      success: false,
      data: { message: "Promo code has reached its maximum uses." },
    });
  }

  promo.usedCount += 1;
  await promo.save();

  return res.status(200).json({
    success: true,
    data: {
      discountType: promo.discountType,
      discountValue: promo.discountValue,
    },
  });
});

export {
  createPromoCode,
  getAllPromoCodes,
  getPromoCodeByID,
  updatePromoCode,
  deletePromoCode,
  applyPromoCode,
};
