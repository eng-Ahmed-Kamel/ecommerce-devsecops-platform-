// category.service.js
import Product from "../products/product.model.js";
import categoryValidation from "./category.validation.js";
import { Category } from "./category.model.js";

const getAllCategories = async (req, res) => {
  try {
    const { categoryName } = req.query;

    // Convert query params to numbers
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    // Ensure valid positive numbers
    const validPage = page > 0 ? page : 1;
    const validLimit = limit > 0 ? limit : 10;

    const skip = (validPage - 1) * validLimit;

    // Build filter
    const filter = {};
    if (categoryName) {
      filter.category_name = { $regex: categoryName, $options: "i" };
    }

    // Aggregation query with proper numbers
    const categories = await Category.aggregate([
      { $match: filter },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "categoryId",
          as: "products",
        },
      },
      { $addFields: { productCount: { $size: "$products" } } },
      { $project: { products: 0 } },
      { $skip: skip }, // ✅ number
      { $limit: validLimit }, // ✅ number
    ]);

    const totalCategories = await Category.countDocuments(filter);
    console.log("raw query:", req.query);
    console.log("page:", page, typeof page);
    console.log("limit:", limit, typeof limit);
    console.log("validLimit:", validLimit, typeof validLimit);
    console.log("skip:", skip, typeof skip);
    res.status(200).json({
      status: "success",
      page: validPage,
      results: categories.length,
      totalCategories,
      data: { categories },
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

const getCategoryByID = async (req, res) => {
  const { id } = req.params;

  const category = await Category.findById(id);
  if (!category)
    return res
      .status(404)
      .json({ status: "fail", message: "Category not found" });

  const products = await Product.find({ categoryId: id });

  res.status(200).json({
    status: "success",
    data: { category, products },
  });
};

const createCategory = async (req, res) => {
  const validatedData = categoryValidation.parse(req.body);
  const category = await Category.create(validatedData);

  res.status(201).json({
    status: "success",
    message: "Category created successfully",
    data: { category },
  });
};
const updateCategory = async (req, res) => {
  const updateSchema = categoryValidation.partial();
  const validatedUpdates = updateSchema.parse(req.body);

  const updatedCategory = await Category.findByIdAndUpdate(
    req.params.id,
    validatedUpdates,
    { new: true, runValidators: true },
  );
  if (!updatedCategory)
    return res
      .status(404)
      .json({ status: "fail", message: "Category not found" });

  res.status(200).json({ status: "success", data: { updatedCategory } });
};

const deleteCategory = async (req, res) => {
  const { id } = req.params;

  const category = await Category.findById(id);
  if (!category)
    return res
      .status(404)
      .json({ status: "fail", message: "Category not found" });

  const productsCount = await Product.countDocuments({ categoryId: id });
  if (productsCount > 0) {
    return res.status(400).json({
      status: "fail",
      message: "Cannot delete category with products",
    });
  }

  await Category.findByIdAndDelete(id);

  res
    .status(200)
    .json({ status: "success", message: "Category deleted successfully" });
};

export {
  getAllCategories,
  getCategoryByID,
  createCategory,
  updateCategory,
  deleteCategory,
};
