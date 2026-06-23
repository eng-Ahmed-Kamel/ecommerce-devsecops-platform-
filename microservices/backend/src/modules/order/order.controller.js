import  { Router } from "express";
import { change_orderStatus, createOrder, getall_orders, getMyOrders } from "./order.service.js";
import { optionalAuth } from "../../midleware/OptionalAuthMiddleware.js";
import { validate } from "../../midleware/validate.middleware.js";
import { createOrderSchema, statusSchema } from "./order.validation.js";

import { catchAsync } from './../../midleware/errorHandler.middleware.js';
import { auth } from "../../midleware/auth.middleware.js";
import { restrictTo } from "../../midleware/Authorization.middleware.js";


export const order_routes = Router();

order_routes.post("/",validate(createOrderSchema) ,optionalAuth,catchAsync(createOrder));
order_routes.get("/",auth,optionalAuth,catchAsync(getMyOrders));

////admin controls
order_routes.get("/all",auth,restrictTo("admin"),catchAsync(getall_orders));
order_routes.patch("/status/:id",auth,restrictTo("admin"),validate(statusSchema),catchAsync(change_orderStatus));



export default order_routes;

