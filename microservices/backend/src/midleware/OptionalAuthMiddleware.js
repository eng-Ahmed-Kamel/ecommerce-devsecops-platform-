import jwt from "jsonwebtoken";
import { User_model } from "../modules/user/user.model.js";

export const optionalAuth = async(req, res, next) => {
  try {
     const token = req.cookies?.accessToken;
    if (token) {
      const decoded = await jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User_model.findOne({
          _id: decoded.id,
          isblocked: false,
          deletedAt: null,
        });
    } else {
      req.user = null; // guest
    }
  } catch {
    req.user = null; // invalid token → treat as guest
  }
  next();
};