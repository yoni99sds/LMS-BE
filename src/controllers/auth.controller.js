import express from "express";
import passport from "passport";

import authController from "../../controllers/auth.controller.js";
import { protect } from "../../middlewares/auth.middleware.js";
import { authLimiter } from "../../middlewares/rateLimiter.middleware.js";
import validateRequest from "../../middlewares/validator.middleware.js";

import {
  signUpValidator,
  loginValidator,
  mfaValidator,
  resetPasswordRequestValidator,
  resetPasswordValidator,
} from "../../utils/validators.js";

const router = express.Router();

// ============================================================
// RATE LIMITING
// ============================================================

router.use(authLimiter);

// ============================================================
// SIGN UP
// ============================================================

router.post(
  "/signup",
  signUpValidator,
  validateRequest,
  authController.signUp
);

// ============================================================
// VERIFY OTP
// ============================================================

router.post(
  "/verify-otp",
  mfaValidator,
  validateRequest,
  authController.verifyMfaOtp
);

// ============================================================
// LOGIN
// ============================================================

router.post(
  "/login",
  loginValidator,
  validateRequest,
  authController.login
);

// ============================================================
// REFRESH TOKEN
// ============================================================

router.post(
  "/refresh-token",
  authController.refreshToken
);

// ============================================================
// LOGOUT
// ============================================================

router.post(
  "/logout",
  protect,
  authController.logout
);

// ============================================================
// FORGOT PASSWORD
// ============================================================

router.post(
  "/forgot-password",
  resetPasswordRequestValidator,
  validateRequest,
  authController.requestPasswordReset
);

// ============================================================
// RESET PASSWORD
// ============================================================

router.post(
  "/reset-password/:token",
  resetPasswordValidator,
  validateRequest,
  authController.resetPassword
);

// ============================================================
// GOOGLE OAUTH
// ============================================================

// Start Google authentication
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    prompt: "select_account",
  })
);

// ============================================================
// GOOGLE OAUTH CALLBACK
// ============================================================

router.get(
  "/google/callback",

  passport.authenticate("google", {
    session: false,

    failureRedirect:
      `${process.env.FRONTEND_URL}/login?error=oauth_failed`,
  }),

  authController.oauthSuccess
);

// ============================================================
// EXPORT ROUTER
// ============================================================

export default router;