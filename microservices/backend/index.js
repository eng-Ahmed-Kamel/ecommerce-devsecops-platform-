import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

import connectDB from "./src/config/database_connection.js";
import { errorHandler } from "./src/midleware/errorHandler.middleware.js";
import { user_routes } from "./src/modules/user/user.controller.js";
import cookieParser from "cookie-parser";
import { product_routes } from "./src/modules/products/product.controller.js";
import { category_routes } from "./src/modules/categories/category.controller.js";
import { rating_routes } from "./src/modules/Ratings/rating.controller.js";
import { cart_routes } from "./src/modules/cart/cart.controller.js";
import { payment_routes } from "./src/modules/payment/payment.controller.js";
import order_routes from "./src/modules/order/order.controller.js";
import { promo_router } from "./src/modules/promo/promocode.controller.js";

const app = express();
const port = process.env.PORT || 3000;
app.use(cors({
  origin: [
    'http://localhost:4200',
    'https://rosselee.netlify.app'
  ],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use((req, res, next) => {
  console.log(`${req.method} ${req.originalUrl}`);
  next();
});
connectDB();

app.use("/api/user", user_routes);
app.use("/api/products", product_routes);
app.use("/api/categories", category_routes);
app.use("/api/products", rating_routes);
app.use("/api/cart", cart_routes);
app.use("/api/payment", payment_routes);
app.use("/api/promo", promo_router);
app.use("/api/order", order_routes);
app.use(errorHandler);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', uptime: process.uptime() });
});

// ... then your app.listen
app.listen(process.env.PORT || 3000, () => {
  console.log(`Server running on port ${process.env.PORT || 3000}`);
});
app.listen(port, () => console.log(`Server running on port ${port}!`));






