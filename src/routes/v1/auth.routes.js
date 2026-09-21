import express from 'express';
import authController from '../../controllers/auth.controller.js';
import { protect } from '../../middlewares/auth.middleware.js';
import { authLimiter } from '../../middlewares/rateLimiter.middleware.js';
import validateRequest from '../../middlewares/validator.middleware.js';
import {
  signUpValidator,
  loginValidator,
  mfaValidator,
  resetPasswordRequestValidator,
  resetPasswordValidator
} from '../../utils/validators.js';

const router = express.Router();

// rate limit only auth routes
router.use(authLimiter);

// ========================
// AUTH ROUTES
// ========================
router.post('/signup', signUpValidator, validateRequest, authController.signUp);

router.post('/verify-otp', mfaValidator, validateRequest, authController.verifyMfaOtp);

router.post('/login', loginValidator, validateRequest, authController.login);

router.post('/refresh-token', authController.refreshToken);

router.post('/logout', protect, authController.logout);

// ========================
// PASSWORD RESET
// ========================
router.post('/forgot-password', resetPasswordRequestValidator, validateRequest, authController.requestPasswordReset);

router.post('/reset-password/:token', resetPasswordValidator, validateRequest, authController.resetPassword);

// ========================
// OAUTH (ONLY GOOGLE LEFT)
// ========================
import passport from 'passport';

router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    prompt: "select_account",
  })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect:
      `${process.env.FRONTEND_URL}/login?error=user_not_found`,
  }),
  authController.oauthSuccess
);

export default router;