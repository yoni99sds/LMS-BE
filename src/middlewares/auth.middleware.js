import jwt from "jsonwebtoken";

import User from "../models/user.model.js";

import AppError from "../utils/AppError.js";

import catchAsync from "../utils/catchAsync.js";

// ============================================================
// PROTECT
// ============================================================

export const protect = catchAsync(
  async (req, res, next) => {
    let token;
    let tokenSource = "none";

    // ========================================================
    // 1. GET TOKEN FROM AUTHORIZATION HEADER
    // ========================================================

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token =
        req.headers.authorization.split(" ")[1];

      tokenSource = "authorization-header";
    }

    // ========================================================
    // 2. GET TOKEN FROM COOKIE
    // ========================================================

    else if (
      req.cookies &&
      req.cookies.accessToken
    ) {
      token = req.cookies.accessToken;

      tokenSource = "cookie";
    }

    // ========================================================
    // DEBUG INFORMATION
    // ========================================================

    console.log(
      "=================================================="
    );

    console.log(
      "🔐 PROTECTED ROUTE REQUEST"
    );

    console.log(
      "Method:",
      req.method
    );

    console.log(
      "URL:",
      req.originalUrl
    );

    console.log(
      "Token source:",
      tokenSource
    );

    console.log(
      "Authorization header present:",
      Boolean(req.headers.authorization)
    );

    console.log(
      "Cookie names:",
      req.cookies
        ? Object.keys(req.cookies)
        : []
    );

    console.log(
      "Access token cookie present:",
      Boolean(req.cookies?.accessToken)
    );

    console.log(
      "Refresh token cookie present:",
      Boolean(req.cookies?.refreshToken)
    );

    console.log(
      "=================================================="
    );

    // ========================================================
    // 3. NO TOKEN
    // ========================================================

    if (!token) {
      console.log(
        "❌ PROTECT FAILED: No access token found"
      );

      return next(
        new AppError(
          "You are not logged in! Please log in to get access.",
          401
        )
      );
    }

    // ========================================================
    // 4. VERIFY JWT
    // ========================================================

    let decoded;

    try {
      decoded = jwt.verify(
        token,
        process.env.JWT_ACCESS_SECRET ||
          "your_super_secret_access_key_change_me_in_production"
      );

      console.log(
        "✅ ACCESS TOKEN VERIFIED"
      );

      console.log(
        "Token user ID:",
        decoded.id
      );

      console.log(
        "Token role:",
        decoded.role
      );
    } catch (error) {
      console.log(
        "❌ ACCESS TOKEN VERIFICATION FAILED"
      );

      console.log(
        "JWT error name:",
        error.name
      );

      console.log(
        "JWT error message:",
        error.message
      );

      return next(
        new AppError(
          "Invalid or expired access token. Please log in again.",
          401
        )
      );
    }

    // ========================================================
    // 5. FIND USER
    // ========================================================

    const currentUser =
      await User.findById(decoded.id);

    if (!currentUser) {
      console.log(
        "❌ USER NOT FOUND FOR JWT"
      );

      console.log(
        "JWT user ID:",
        decoded.id
      );

      return next(
        new AppError(
          "The user belonging to this token no longer exists.",
          401
        )
      );
    }

    console.log(
      "✅ USER FOUND FOR JWT"
    );

    console.log(
      "User ID:",
      currentUser._id.toString()
    );

    console.log(
      "User email:",
      currentUser.email
    );

    console.log(
      "User role:",
      currentUser.role
    );

    console.log(
      "User status:",
      currentUser.status
    );

    // ========================================================
    // 6. CHECK ACCOUNT STATUS
    // ========================================================

    if (
      currentUser.status !== "Active"
    ) {
      console.log(
        "❌ USER ACCOUNT IS NOT ACTIVE"
      );

      console.log(
        "Current status:",
        currentUser.status
      );

      return next(
        new AppError(
          "Your account has been suspended or is not yet active. Please contact administrator.",
          403
        )
      );
    }

    // ========================================================
    // 7. AUTHENTICATED
    // ========================================================

    req.user = currentUser;

    console.log(
      "✅ PROTECTED ROUTE AUTHENTICATION SUCCESS"
    );

    return next();
  }
);

// ============================================================
// ROLE-BASED AUTHORIZATION
// ============================================================

export const restrictTo =
  (...roles) => {
    return (req, res, next) => {
      if (
        !req.user ||
        !roles.includes(req.user.role)
      ) {
        return next(
          new AppError(
            "You do not have permission to perform this action",
            403
          )
        );
      }

      next();
    };
  };