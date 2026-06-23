import jwt from "jsonwebtoken";
import {User_model} from '../modules/user/user.model.js'


export const auth = async (req, res, next) => {
  try {
    const token = req.cookies?.accessToken;
    const refreshToken = req.cookies?.refreshToken;

    if (!token) {
      if (!refreshToken) {
        return res.status(401).json({
          status: "fail",
          message: "No tokens provided",
        });
      }

      try {
        const decodedRefresh = jwt.verify(
          refreshToken,
          process.env.JWT_REFRESH_SECRET
        );

        const user = await User_model.findOne({
          _id: decodedRefresh.id,
          isblocked: false,
          deletedAt: null,
        });

        if (!user) {
          return res.status(401).json({
            status: "fail",
            message: "This account is blocked or has been deleted",
          });
        }

        const newAccessToken = jwt.sign(
          { id: user._id },
          process.env.JWT_SECRET,
          { expiresIn: "15m" }
        );

        res.cookie("accessToken", newAccessToken, {
          httpOnly: true,
          maxAge: 15 * 60 * 1000,
         sameSite: 'none',  
         secure: true, 
        });

        req.user = user;
        return next();
      } catch {
        return res.status(403).json({
          status: "fail",
          message: "Invalid refresh token",
        });
      }
    }

    // Verify access token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User_model.findOne({
      _id: decoded.id,
      isblocked: false,
      deletedAt: null,
    });

    if (!user) {
      return res.status(401).json({
        status: "fail",
        message: "This account is blocked or has been deleted",
      });
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError" && req.cookies?.refreshToken) {
      try {
        const decodedRefresh = jwt.verify(
          req.cookies.refreshToken,
          process.env.JWT_REFRESH_SECRET
        );

        const user = await User_model.findOne({
          _id: decodedRefresh.id,
          isblocked: false,
          deletedAt: null,
        });

        if (!user) {
          return res.status(401).json({
            status: "fail",
            message: "This account is blocked or has been deleted",
          });
        }

        const newAccessToken = jwt.sign(
          { id: user._id },
          process.env.JWT_SECRET,
          { expiresIn: "15m" }
        );

        res.cookie("accessToken", newAccessToken, {
          httpOnly: true,
          maxAge: 15 * 60 * 1000,
           sameSite: 'none',  
         secure: true, 
        });

        req.user = user;
        return next();
      } catch {
        return res.status(403).json({
          status: "fail",
          message: "Refresh token invalid or expired",
        });
      }
    }

    next(err);
  }
};