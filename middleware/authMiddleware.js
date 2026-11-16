import jwt from "jsonwebtoken";
import User from "../models/User.js";

/**
 * Protect routes - Verifies JWT token from Authorization header or cookies
 */
export const protect = async (req, res, next) => {
  let token;

  // Check Bearer token in header or cookie
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Not authorized. Please login to access this resource.",
    });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "khojobangla_classifieds_bangladesh_jwt_secret_token_2026_key"
    );

    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User account associated with this token no longer exists.",
      });
    }

    if (user.isSuspended || user.status === "suspended") {
      return res.status(403).json({
        success: false,
        message: "Your account has been suspended by administration. Please contact support.",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message:
        error.name === "TokenExpiredError"
          ? "Session expired. Please log in again."
          : "Invalid authentication token.",
    });
  }
};

/**
 * Superadmin Authorization Middleware
 * Verifies that the authenticated user possesses the 'superadmin' role.
 */
export const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "superadmin") {
    return res.status(403).json({
      success: false,
      message: "Access forbidden. Superadmin privileges required.",
    });
  }
  next();
};
