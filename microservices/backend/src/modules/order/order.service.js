import Cart from "../cart/cart.model.js";
import Order from "./order.model.js";
import { sendEmail } from "./../../utils/email/email_service.js";

export const createOrder = async (req, res) => {
  const {
    paymentMethod,
    governorate,
    city,
    street,
    guestName,
    guestEmail,
    guestPhone,
  } = req.body;

  const userId = req.user?._id || null;
  console.log("user:" + req.user._id);

  let products = [];
  let totalAmount = 0;
  let discount = 0; // ← added
  let promoCode = null; // ← added

  if (userId) {
    const cart = await Cart.findOne({ user_id: userId }).populate(
      "products.product",
    );

    if (!cart || cart.products.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    products = cart.products.map((item) => ({
      product: item.product._id,
      quantity: item.quantity,
      price: item.product.price,
    }));

    // ← Read discount and promoCode saved by apply-promo
    discount = cart.discount ?? 0;
    promoCode = cart.promoCode ?? null;

    // totalAmount is the final amount after discount
    totalAmount = cart.finalAmount > 0 ? cart.finalAmount : cart.totalAmount;

    await Cart.findOneAndDelete({ user_id: userId });
  } else {
    if (!req.body.products || req.body.products.length === 0) {
      return res.status(400).json({ message: "No products provided" });
    }

    products = req.body.products.map((item) => ({
      product: item.productId,
      quantity: item.quantity,
      price: item.price,
    }));

    totalAmount = products.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );
  }

  const order = await Order.create({
    user_id: userId,
    products,
    totalAmount,
    discount, // ← added
    promoCode, // ← added
    status: "pending",
    paymentMethod,
    shippingAddress: { governorate, city, street },
    guestInfo: !userId
      ? { name: guestName, email: guestEmail, phone: guestPhone }
      : undefined,
  });

  const populatedOrder = await Order.findById(order._id).populate(
    "products.product",
    "name",
  );

  await sendEmail({
    to: req.user?.email || guestEmail,
    type: "orderdetails",
    order: {
      ...populatedOrder.toObject(),
      customerName: req.user?.name || guestName,
    },
  });

  res
    .status(201)
    .json({ success: true, message: "Order placed successfully", order });
};

export const getMyOrders = async (req, res) => {
  const orders = await Order.find({ user_id: req.user._id })
    .populate("products.product", "name price image")
    .sort({ createdAt: -1 });

  if (!orders.length) {
    return res.status(404).json({ message: "No orders found" });
  }

  res.status(200).json({ success: true, count: orders.length, orders });
};

export const getall_orders = async (req, res) => {
  const orders = await Order.find({})
    .populate("products.product", "name price image")
    .sort({ createdAt: -1 });

  if (!orders.length) {
    return res.status(404).json({ message: "No orders found" });
  }

  res.status(200).json({ success: true, count: orders.length, orders });
};

export const change_orderStatus = async (req, res) => {
  const id = req.params.id;
  const { status } = req.body;

  const order = await Order.findByIdAndUpdate(
    id,
    { status },
    { new: true, runValidators: true },
  );

  if (!order) {
    return res.status(404).json({ message: "No order with this id" });
  }

  res
    .status(200)
    .json({ success: true, message: "Status updated successfully", order });
};
