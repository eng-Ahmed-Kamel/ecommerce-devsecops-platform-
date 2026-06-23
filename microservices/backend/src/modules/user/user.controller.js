import express, { Router } from "express";
import { catchAsync } from "../../midleware/errorHandler.middleware.js";
import { forget_password, getuser, login, logout, resend_otp, signup, signup_bygoogle, verify_account, delete_user, update_user, BlockAndUnblock, getall_users } from "./user.service.js";
import { validate } from "../../midleware/validate.middleware.js";
import {forget_passwordSchema, loginSchema, resendOtpSchema, update_Schema, userValidationSchema, verifySchema} from "./user.validation.js";
import { auth } from "../../midleware/auth.middleware.js";
import { getall_orders } from "../order/order.service.js";
import { restrictTo } from "../../midleware/Authorization.middleware.js";
export const user_routes = Router(); 

user_routes.post("/signup",validate(userValidationSchema),catchAsync(signup))
user_routes.post("/resend_otp",validate(resendOtpSchema),catchAsync(resend_otp))
user_routes.post("/verify_account",validate(verifySchema),catchAsync(verify_account))
user_routes.post("/login",validate(loginSchema),catchAsync(login))
user_routes.post("/forget_password",validate(forget_passwordSchema),catchAsync(forget_password))
user_routes.get("/myprofile",auth,catchAsync(getuser))
user_routes.get("/logout",auth,catchAsync(logout))
user_routes.post("/signup_bygoogle",signup_bygoogle)  //test
user_routes.patch("/update_user",validate(update_Schema),auth,catchAsync(update_user))
user_routes.delete("/delete_user",auth,catchAsync(delete_user))

////admin controls
user_routes.get("/all",auth,restrictTo("admin"),catchAsync(getall_users));
user_routes.patch("/block/:id",auth,restrictTo("admin"),catchAsync(BlockAndUnblock));

