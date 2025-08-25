import jwt from "jsonwebtoken";
import serverConfig from "../config/serverConfig.js";

export async function isLoggedIn(req, res, next) {
  console.log("isLoggedIn middleware triggered");

  const token = req.cookies?.authToken;
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "You are not logged in, please login to continue",
      data: {},
      error: "Missing token",
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, serverConfig.JWT_SECRET);

    if (!decoded?.id) {
      return res.status(401).json({
        success: false,
        message: "Invalid token payload",
        data: {},
        error: "Token missing id/email",
      });
    }

    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role || "user",
    };

    if (!req.user?.id) {
      return res.status(401).json({ 
        success: false, 
        message: "Unauthorized: user not found in token" 
      });
    }

    next();
  } catch (error) {
    console.error("JWT verification failed:", error.message);
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
      data: {},
      error: error.message,
    });
  }
}
