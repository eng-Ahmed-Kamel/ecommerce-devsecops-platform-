import Product from "../products/product.model.js";
import promocodeModel from "../promo/promocode.model.js";
import Cart from "./cart.model.js";

export const add_product = async (req, res) => {
  const { productId, quantity = 1 } = req.body;

  const product = await Product.findById(productId);
  if (!product) {
    return res
      .status(404)
      .json({ status: "fail", message: "Product not found" });
  }

  let cart = await Cart.findOne({ user_id: req.user._id }).populate(
    "products.product",
  );
  if (!cart) {
    cart = await Cart.create({
      user_id: req.user._id,
      products: [],
      totalAmount: 0,
    });
  }

  const index = cart.products.findIndex(
    (item) => item.product && item.product._id && item.product._id.toString() === productId,
  );

  if (index > -1) {
    cart.products[index].quantity += quantity;
  } else {
    cart.products.push({ product: productId, quantity });
  }

  await cart.populate("products.product");
  cart.totalAmount = cart.products.reduce(
    (sum, item) => sum + item.quantity * (item.product?.price || 0),
    0,
  );

  await cart.save();
  res.status(200).json({ status: "success", cart });
};

export const remove_product = async (req, res) => {
  const { productId } = req.params;

  let cart = await Cart.findOne({ user_id: req.user._id }).populate(
    "products.product",
  );
  if (!cart) {
    return res.status(404).json({ status: "fail", message: "Cart not found" });
  }

  cart.products = cart.products.filter(
    (item) => item.product && item.product._id && item.product._id.toString() !== productId,
  );

  cart.totalAmount = cart.products.reduce(
    (sum, item) => sum + item.quantity * (item.product?.price || 0),
    0,
  );
  // reset promo if cart is empty
  if (cart.products.length === 0) {
    cart.discount = 0;
    cart.finalAmount = 0;
    cart.promoCode = null;
  } else {
    cart.finalAmount = Math.max(cart.totalAmount - cart.discount, 0);
  }

  await cart.save();
  res.status(200).json({ status: "success", cart });
};

export const quantity_adjustment = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    let cart = await Cart.findOne({ user_id: req.user._id }).populate(
      "products.product"
    );

    if (!cart) {
      return res.status(404).json({ status: "fail", message: "Cart not found" });
    }

    const index = cart.products.findIndex(
      (item) => item.product && item.product._id && item.product._id.toString() === productId
    );

    if (index === -1) {
      return res
        .status(404)
        .json({ status: "fail", message: "Product not in cart" });
    }

    // Update quantity
    if (quantity <= 0) {
      cart.products.splice(index, 1);
    } else {
      cart.products[index].quantity = quantity;
    }

    // Recalculate total
    cart.totalAmount = cart.products.reduce(
      (sum, item) => sum + item.quantity * (item.product?.price || 0),
      0
    );

    // Recalculate discount if promo exists
    if (cart.promoCode) {
      const promo = await promocodeModel.findOne({
        code: cart.promoCode,
        isActive: true,
      });

      if (promo) {
        let discount = 0;

        if (promo.discountType === "percentage") {
          discount = (cart.totalAmount * promo.discountValue) / 100;
        } else {
          discount = promo.discountValue;
        }

        discount = Math.min(discount, cart.totalAmount);

        cart.discount = Number(discount.toFixed(2));
        cart.finalAmount = Number(
          (cart.totalAmount - cart.discount).toFixed(2)
        );
      } else {
        // Promo no longer valid
        cart.discount = 0;
        cart.finalAmount = cart.totalAmount;
        cart.promoCode = null;
      }
    } else {
      cart.discount = 0;
      cart.finalAmount = cart.totalAmount;
    }

    await cart.save();

    res.status(200).json({ status: "success", cart });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

export const get_cart = async (req, res) => {
  let cart = await Cart.findOne({ user_id: req.user._id }).populate(
    "products.product",
  );
  if (!cart) cart = { products: [], totalAmount: 0 };
  res.status(200).json({ status: "success", cart });
};

export const apply_promo = async (req, res) => {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: "Promo code is required",
      });
    }

    const cart = await Cart.findOne({ user_id: req.user._id }).populate(
      "products.product",
    );

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    if (!cart.products.length) {
      return res.status(400).json({
        success: false,
        message: "Cart is empty",
      });
    }

    // Calculate total amount
    const totalAmount = cart.products.reduce((sum, item) => {
      return sum + item.quantity * item.product.price;
    }, 0);

    cart.totalAmount = totalAmount;

    // Find promo (case insensitive)
    const promo = await promocodeModel.findOne({
      code: code.toUpperCase(),
      isActive: true,
    });

    if (!promo) {
      return res.status(404).json({
        success: false,
        message: "Invalid or inactive promo code",
      });
    }

    // Expiration check
    if (promo.expiresAt && promo.expiresAt < new Date()) {
      return res.status(400).json({
        success: false,
        message: "Promo code has expired",
      });
    }

    // Max usage check
    if (promo.usedCount >= promo.maxUses) {
      return res.status(400).json({
        success: false,
        message: "Promo code usage limit reached",
      });
    }

    // Prevent applying another promo
    if (cart.promoCode && cart.promoCode !== promo.code) {
      return res.status(400).json({
        success: false,
        message: "A promo code is already applied to this cart",
      });
    }

    let discount = 0;

    if (promo.discountType === "percentage") {
      discount = (totalAmount * promo.discountValue) / 100;
    } else {
      discount = promo.discountValue;
    }

    // Prevent discount > total
    discount = Math.min(discount, totalAmount);

    // Round to 2 decimals
    discount = Number(discount.toFixed(2));

    const finalAmount = Number((totalAmount - discount).toFixed(2));

    cart.discount = discount;
    cart.finalAmount = finalAmount;
    cart.promoCode = promo.code;

    // ⚠️ Do NOT increase usedCount here
    // Increase it after successful order checkout instead

    await cart.save();

    return res.status(200).json({
      success: true,
      data: {
        totalAmount,
        discount,
        finalAmount,
        promoCode: promo.code,
      },
    });
  
};
