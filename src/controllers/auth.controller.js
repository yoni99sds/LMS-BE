import authService from "../services/auth.service.js";
import catchAsync from "../utils/catchAsync.js";
import jwt from "jsonwebtoken";
import AppError from "../utils/AppError.js";

// ============================================================
// COOKIE CONFIGURATION
// ============================================================
//
// Render is currently reporting NODE_ENV=development even
// though the backend is deployed over HTTPS.
//
// Therefore we determine production cookie behavior from
// FRONTEND_URL instead of NODE_ENV.
//
// Production:
//   Frontend = https://lms-jet-zeta.vercel.app
//   secure = true
//   sameSite = none
//
// Local:
//   Frontend = http://localhost:3000
//   secure = false
//   sameSite = lax
//
// ============================================================

const isProductionEnvironment =
  process.env.FRONTEND_URL?.startsWith("https://");

const getCookieOptions = () => {
  if (isProductionEnvironment) {
    return {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
    };
  }

  return {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    path: "/",
  };
};

// ============================================================
// SET AUTH COOKIES
// ============================================================

const setCookies = (
  res,
  accessToken,
  refreshToken
) => {
  const cookieOptions =
    getCookieOptions();

  console.log(
    "=================================================="
  );

  console.log(
    "🍪 SETTING AUTH COOKIES"
  );

  console.log(
    "Frontend URL:",
    process.env.FRONTEND_URL
  );

  console.log(
    "Production cookie mode:",
    isProductionEnvironment
  );

  console.log(
    "Cookie secure:",
    cookieOptions.secure
  );

  console.log(
    "Cookie sameSite:",
    cookieOptions.sameSite
  );

  console.log(
    "Cookie path:",
    cookieOptions.path
  );

  console.log(
    "=================================================="
  );

  // ----------------------------------------------------------
  // ACCESS TOKEN
  // ----------------------------------------------------------

  res.cookie(
    "accessToken",
    accessToken,
    {
      ...cookieOptions,

      // 15 minutes
      maxAge: 15 * 60 * 1000,
    }
  );

  // ----------------------------------------------------------
  // REFRESH TOKEN
  // ----------------------------------------------------------

  res.cookie(
    "refreshToken",
    refreshToken,
    {
      ...cookieOptions,

      // 7 days
      maxAge:
        7 * 24 * 60 * 60 * 1000,
    }
  );
};

// ============================================================
// AUTH CONTROLLER
// ============================================================

export const authController = {

  // ==========================================================
  // SIGN UP
  // ==========================================================

  signUp: catchAsync(
    async (req, res) => {
      const user =
        await authService.signUp(
          req.body,
          req.ip,
          req.headers["user-agent"]
        );

      return res.status(201).json({
        status: "success",
        message:
          "OTP sent to your email",
        data: {
          email: user.email,
        },
      });
    }
  ),

  // ==========================================================
  // VERIFY MFA / EMAIL OTP
  // ==========================================================

  verifyMfaOtp: catchAsync(
    async (req, res) => {
      const {
        email,
        otp,
      } = req.body;

      if (!email || !otp) {
        throw new AppError(
          "Email and OTP are required",
          400
        );
      }

      const result =
        await authService.verifyEmailOtp(
          email,
          otp
        );

      setCookies(
        res,
        result.accessToken,
        result.refreshToken
      );

      return res.status(200).json({
        status: "success",
        message:
          "Email verified successfully",
        data: {
          user: result.user,
        },
        token:
          result.accessToken,
      });
    }
  ),

  // ==========================================================
  // LOGIN
  // ==========================================================

  login: catchAsync(
    async (req, res) => {
      const result =
        await authService.login(
          req.body,
          req.ip,
          req.headers["user-agent"]
        );

      setCookies(
        res,
        result.accessToken,
        result.refreshToken
      );

      return res.status(200).json({
        status: "success",
        token:
          result.accessToken,
        data: {
          user: result.user,
        },
      });
    }
  ),

  // ==========================================================
  // REFRESH TOKEN
  // ==========================================================

  refreshToken: catchAsync(
    async (req, res) => {
      const token =
        req.cookies?.refreshToken ||
        req.body?.refreshToken;

      if (!token) {
        throw new AppError(
          "Refresh token missing",
          401
        );
      }

      const result =
        await authService.refreshTokens(
          token
        );

      setCookies(
        res,
        result.accessToken,
        result.refreshToken
      );

      return res.status(200).json({
        status: "success",
        token:
          result.accessToken,
      });
    }
  ),

  // ==========================================================
  // LOGOUT
  // ==========================================================

  logout: catchAsync(
    async (req, res) => {

      if (req.user?._id) {
        await authService.logout(
          req.user._id,
          req.ip,
          req.headers["user-agent"]
        );
      }

      const cookieOptions =
        getCookieOptions();

      console.log(
        "🍪 Clearing authentication cookies"
      );

      res.clearCookie(
        "accessToken",
        cookieOptions
      );

      res.clearCookie(
        "refreshToken",
        cookieOptions
      );

      return res.status(200).json({
        status: "success",
        message:
          "Logged out successfully",
      });
    }
  ),

  // ==========================================================
  // FORGOT PASSWORD
  // ==========================================================

  requestPasswordReset:
    catchAsync(
      async (req, res) => {

        const reqHost =
          `${req.protocol}://${req.get("host")}`;

        const result =
          await authService.requestPasswordReset(
            req.body.email,
            reqHost,
            req.ip,
            req.headers["user-agent"]
          );

        return res.status(200).json({
          status: "success",
          message: result.message,
        });
      }
    ),

  // ==========================================================
  // RESET PASSWORD
  // ==========================================================

  resetPassword:
    catchAsync(
      async (req, res) => {

        const result =
          await authService.resetPassword(
            req.params.token,
            req.body.password,
            req.ip,
            req.headers["user-agent"]
          );

        return res.status(200).json({
          status: "success",
          message: result.message,
        });
      }
    ),

  // ==========================================================
  // GOOGLE OAUTH SUCCESS
  // ==========================================================

  oauthSuccess:
    catchAsync(
      async (req, res) => {

        console.log(
          "=================================================="
        );

        console.log(
          "🟢 GOOGLE OAUTH SUCCESS HANDLER"
        );

        // ----------------------------------------------------
        // CHECK USER
        // ----------------------------------------------------

        if (!req.user) {
          console.log(
            "❌ req.user is missing"
          );

          return res.redirect(
            `${process.env.FRONTEND_URL}/login?error=oauth_failed`
          );
        }

        const user =
          req.user;

        console.log(
          "Authenticated user:",
          user.email
        );

        console.log(
          "User ID:",
          user._id.toString()
        );

        console.log(
          "User role:",
          user.role
        );

        // ----------------------------------------------------
        // CHECK USER EMAIL
        // ----------------------------------------------------

        if (
          !user.email
        ) {
          console.log(
            "❌ User email is missing"
          );

          return res.redirect(
            `${process.env.FRONTEND_URL}/login?error=user_not_found`
          );
        }

        // ----------------------------------------------------
        // CREATE ACCESS TOKEN
        // ----------------------------------------------------

        const accessToken =
          jwt.sign(
            {
              id: user._id,
              role: user.role,
            },
            process.env.JWT_ACCESS_SECRET,
            {
              expiresIn: "15m",
            }
          );

        // ----------------------------------------------------
        // CREATE REFRESH TOKEN
        // ----------------------------------------------------

        const refreshToken =
          jwt.sign(
            {
              id: user._id,
              role: user.role,
            },
            process.env.JWT_REFRESH_SECRET,
            {
              expiresIn: "7d",
            }
          );

        console.log(
          "✅ Access token created"
        );

        console.log(
          "✅ Refresh token created"
        );

        // ----------------------------------------------------
        // SET HTTP-ONLY COOKIES
        // ----------------------------------------------------

        setCookies(
          res,
          accessToken,
          refreshToken
        );

        console.log(
          "✅ Authentication cookies added to response"
        );

        // ----------------------------------------------------
        // REDIRECT TO FRONTEND
        // ----------------------------------------------------

        const redirectUrl =
          `${process.env.FRONTEND_URL}/oauth-callback?role=${encodeURIComponent(
            user.role
          )}`;

        console.log(
          "➡️ Redirecting to:",
          redirectUrl
        );

        console.log(
          "=================================================="
        );

        return res.redirect(
          redirectUrl
        );
      }
    ),
};

export default authController;