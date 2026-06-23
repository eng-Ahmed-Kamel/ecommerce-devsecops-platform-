import Stripe from "stripe";
import { catchAsync } from "../../midleware/errorHandler.middleware.js";
import { User_model } from "../user/user.model.js";
import { Payment_model } from "./payment.model.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const createCustomer = catchAsync(async (req, res) => {
  const user = await User_model.findById(req.user._id);
  console.log("3. user from DB:", user);
  console.log("4. stripeCustomerId:", user?.stripeCustomerId);

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  if (user.stripeCustomerId) {
    return res.status(200).json({ customerId: user.stripeCustomerId });
  }

  const customer = await stripe.customers.create({
    name: user.name,
    email: user.email,
  });

  await User_model.findByIdAndUpdate(req.user._id, {
    stripeCustomerId: customer.id,
  });

  res.status(200).json({ customerId: customer.id });
});

const addNewCard = catchAsync(async (req, res) => {
  console.log("req.body:", req.body);
  const { card_token } = req.body;
  console.log("card_token:", card_token);
  const user = await User_model.findById(req.user._id);

  if (!user.stripeCustomerId) {
    return res.status(400).json({ error: "Create a customer first" });
  }

  const card = await stripe.customers.createSource(user.stripeCustomerId, {
    source: card_token,
  });

  res.status(200).json({ card: card.id });
});

const createCharge = catchAsync(async (req, res) => {
  const { amount, currency, description } = req.body;

  const user = await User_model.findById(req.user._id);

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  if (!user.stripeCustomerId) {
    return res.status(400).json({ error: "Create a customer first" });
  }

  const charge = await stripe.charges.create({
    amount: amount * 100,
    currency: currency || "usd",
    customer: user.stripeCustomerId,
    description: description || "Payment",
  });

  const payment = await Payment_model.create({
    user: req.user._id,
    stripeCustomerId: user.stripeCustomerId,
    stripeChargeId: charge.id,
    amount: charge.amount / 100,
    currency: charge.currency,
    status: charge.status,
    description: charge.description,
  });

  res.status(200).json({
    success: true,
    chargeId: charge.id,
    amount: payment.amount,
    currency: payment.currency,
    status: payment.status,
  });
});

const getCards = catchAsync(async (req, res) => {
  const user = await User_model.findById(req.user._id);

  if (!user.stripeCustomerId) {
    return res.status(400).json({ error: "No customer found" });
  }

  const cards = await stripe.customers.listSources(user.stripeCustomerId, {
    object: "card",
  });

  res.status(200).json({ cards: cards.data });
});

const deleteCard = catchAsync(async (req, res) => {
  const { cardId } = req.params;

  const user = await User_model.findById(req.user._id);

  if (!user.stripeCustomerId) {
    return res.status(400).json({ error: "No customer found" });
  }

  await stripe.customers.deleteSource(user.stripeCustomerId, cardId);

  res.status(200).json({ message: "Card deleted successfully" });
});

export { createCustomer, addNewCard, createCharge, getCards, deleteCard };
