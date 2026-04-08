import rateLimit from "express-rate-limit";

// Strict limiter for login — 10 attempts per 15 minutes
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    message: "Too many login attempts. Please try again after 15 minutes.",
  },
  standardHeaders: true, // Return rate limit info in RateLimit-* headers
  legacyHeaders: false,
});

// Slightly looser for signup — 5 accounts per hour per IP
export const signupLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    message: "Too many accounts created from this IP. Please try again after an hour.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
