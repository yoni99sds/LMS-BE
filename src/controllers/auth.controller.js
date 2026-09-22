import authService from "../services/auth.service.js";
import catchAsync from "../utils/catchAsync.js";
import jwt from "jsonwebtoken";
import AppError from "../utils/AppError.js";

/*
|--------------------------------------------------------------------------
| Environment
|--------------------------------------------------------------------------
*/

const isProductionEnvironment =
  process.env.FRONTEND_URL?.startsWith("https://");

/*
|--------------------------------------------------------------------------
| Cookie Options
|--------------------------------------------------------------------------
|
| Production:
| - secure: true
| - sameSite: "lax"
|
| Development:
| - secure: false
| - sameSite: "lax"
|
*/

const getCookieOptions = () => {
  if (isProductionEnvironment) {
    return {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
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

/*
|--------------------------------------------------------------------------
| Set Authentication Cookies
|--------------------------------------------------------------------------
*/

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

  /*
   * Access Token
   */
  res.cookie(
    "accessToken",
    accessToken,
    {
      ...cookieOptions,

      // 15 minutes
      maxAge: 15 * 60 * 1000,
    }
  );

  /*
   * Refresh Token
   */
  res.cookie(
    "refreshToken",
    refreshToken,
    {
      ...cookieOptions,

      // 7 days
      maxAge: 7 * 24 * 60 * 60 * 1000,
    }
  );
};

/*
|--------------------------------------------------------------------------
| Auth Controller
|--------------------------------------------------------------------------
*/

export const authController = {
  /*
  |--------------------------------------------------------------------------
  | SIGN UP
  |--------------------------------------------------------------------------
  */

  signUp: catchAsync(async (req, res) => {
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
  }),

  /*
  |--------------------------------------------------------------------------
  | VERIFY OTP
  |--------------------------------------------------------------------------
  */

  verifyMfaOtp: catchAsync(async (req, res) => {
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

    /*
     * Set authentication cookies
     */
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

      /*
       * Kept for compatibility with
       * your existing frontend.
       *
       * The actual authentication is
       * handled by the httpOnly cookie.
       */
      token: result.accessToken,
    });
  }),

  /*
  |--------------------------------------------------------------------------
  | LOGIN
  |--------------------------------------------------------------------------
  */

  login: catchAsync(async (req, res) => {
    const result =
      await authService.login(
        req.body,
        req.ip,
        req.headers["user-agent"]
      );

    /*
     * Set authentication cookies
     */
    setCookies(
      res,
      result.accessToken,
      result.refreshToken
    );

    return res.status(200).json({
      status: "success",

      /*
       * Kept for compatibility.
       *
       * Do NOT put this token into the
       * Google OAuth URL.
       */
      token: result.accessToken,

      data: {
        user: result.user,
      },
    });
  }),

  /*
  |--------------------------------------------------------------------------
  | REFRESH TOKEN
  |--------------------------------------------------------------------------
  */

  refreshToken: catchAsync(async (req, res) => {
    /*
     * Prefer refresh token from
     * httpOnly cookie.
     *
     * Body fallback is kept for
     * compatibility with existing code.
     */
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

    /*
     * Replace old cookies with
     * newly generated tokens.
     */
    setCookies(
      res,
      result.accessToken,
      result.refreshToken
    );

    return res.status(200).json({
      status: "success",

      token: result.accessToken,
    });
  }),

  /*
  |--------------------------------------------------------------------------
  | LOGOUT
  |--------------------------------------------------------------------------
  */

  logout: catchAsync(async (req, res) => {
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

    /*
     * Clear access token
     */
    res.clearCookie(
      "accessToken",
      cookieOptions
    );

    /*
     * Clear refresh token
     */
    res.clearCookie(
      "refreshToken",
      cookieOptions
    );

    return res.status(200).json({
      status: "success",

      message:
        "Logged out successfully",
    });
  }),

  /*
  |--------------------------------------------------------------------------
  | REQUEST PASSWORD RESET
  |--------------------------------------------------------------------------
  */

  requestPasswordReset: catchAsync(
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

        message:
          result.message,
      });
    }
  ),

  /*
  |--------------------------------------------------------------------------
  | RESET PASSWORD
  |--------------------------------------------------------------------------
  */

  resetPassword: catchAsync(
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

        message:
          result.message,
      });
    }
  ),

  /*
  |--------------------------------------------------------------------------
  | GOOGLE OAUTH SUCCESS
  |--------------------------------------------------------------------------
  */

  oauthSuccess: catchAsync(
    async (req, res) => {
      console.log(
        "=================================================="
      );

      console.log(
        "🟢 GOOGLE OAUTH SUCCESS HANDLER"
      );

      /*
       * Passport should have attached
       * the authenticated user to req.user.
       */
      if (!req.user) {
        console.log(
          "❌ req.user is missing"
        );

        return res.redirect(
          `${process.env.FRONTEND_URL}/login?error=oauth_failed`
        );
      }

      const user = req.user;

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

      /*
       * Make sure the authenticated
       * user has an email.
       */
      if (!user.email) {
        console.log(
          "❌ User email is missing"
        );

        return res.redirect(
          `${process.env.FRONTEND_URL}/login?error=user_not_found`
        );
      }

      /*
       * Create Access Token
       */
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

      /*
       * Create Refresh Token
       */
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

      /*
       * IMPORTANT:
       *
       * Tokens are stored in httpOnly
       * cookies.
       *
       * They are NOT placed in the
       * frontend URL.
       */
      setCookies(
        res,
        accessToken,
        refreshToken
      );

      console.log(
        "✅ Authentication cookies added to response"
      );

      /*
       * Redirect to frontend.
       *
       * Only the role is included.
       * NO JWT is included in the URL.
       */
      const frontendUrl =
        (
          process.env.FRONTEND_URL ||
          "http://localhost:3000"
        ).replace(/\/+$/, "");

      const redirectUrl =
        `${frontendUrl}/oauth-callback?role=${encodeURIComponent(
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