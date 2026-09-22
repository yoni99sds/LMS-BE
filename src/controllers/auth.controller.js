import authService from '../services/auth.service.js';
import catchAsync from '../utils/catchAsync.js';
import jwt from 'jsonwebtoken';
import AppError from '../utils/AppError.js';

// ================= COOKIE SETTER =================
const setCookies = (res, accessToken, refreshToken) => {
  const isProd = process.env.NODE_ENV === 'production';

  const cookieOptions = {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
  };

  res.cookie('accessToken', accessToken, {
    ...cookieOptions,
    maxAge: 15 * 60 * 1000,
  });

  res.cookie('refreshToken', refreshToken, {
    ...cookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

// ================= CONTROLLER =================
export const authController = {

  // ================= SIGNUP =================
  signUp: catchAsync(async (req, res) => {
    const user = await authService.signUp(
      req.body,
      req.ip,
      req.headers['user-agent']
    );

    return res.status(201).json({
      status: 'success',
      message: 'OTP sent to your email',
      data: {
        email: user.email,
      },
    });
  }),

  // ================= VERIFY OTP =================
  verifyMfaOtp: catchAsync(async (req, res) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
      throw new AppError('Email and OTP are required', 400);
    }

    const result = await authService.verifyEmailOtp(email, otp);

    setCookies(
      res,
      result.accessToken,
      result.refreshToken
    );

    return res.status(200).json({
      status: 'success',
      message: 'Email verified successfully',
      data: {
        user: result.user,
      },
      token: result.accessToken,
    });
  }),

  // ================= LOGIN =================
  login: catchAsync(async (req, res) => {
    const result = await authService.login(
      req.body,
      req.ip,
      req.headers['user-agent']
    );

    setCookies(
      res,
      result.accessToken,
      result.refreshToken
    );

    return res.status(200).json({
      status: 'success',
      token: result.accessToken,
      data: {
        user: result.user,
      },
    });
  }),

  // ================= REFRESH TOKEN =================
  refreshToken: catchAsync(async (req, res) => {
    const token =
      req.cookies?.refreshToken ||
      req.body.refreshToken;

    if (!token) {
      throw new AppError(
        'Refresh token missing',
        401
      );
    }

    const result =
      await authService.refreshTokens(token);

    setCookies(
      res,
      result.accessToken,
      result.refreshToken
    );

    return res.status(200).json({
      status: 'success',
      token: result.accessToken,
    });
  }),

  // ================= LOGOUT =================
  logout: catchAsync(async (req, res) => {
    if (req.user?._id) {
      await authService.logout(
        req.user._id,
        req.ip,
        req.headers['user-agent']
      );
    }

    const isProd =
      process.env.NODE_ENV === 'production';

    const clearCookieOptions = {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
    };

    res.clearCookie(
      'accessToken',
      clearCookieOptions
    );

    res.clearCookie(
      'refreshToken',
      clearCookieOptions
    );

    return res.status(200).json({
      status: 'success',
      message: 'Logged out successfully',
    });
  }),

  // ================= PASSWORD RESET REQUEST =================
  requestPasswordReset: catchAsync(async (req, res) => {
    const reqHost =
      `${req.protocol}://${req.get('host')}`;

    const result =
      await authService.requestPasswordReset(
        req.body.email,
        reqHost,
        req.ip,
        req.headers['user-agent']
      );

    return res.status(200).json({
      status: 'success',
      message: result.message,
    });
  }),

  // ================= RESET PASSWORD =================
  resetPassword: catchAsync(async (req, res) => {
    const result =
      await authService.resetPassword(
        req.params.token,
        req.body.password,
        req.ip,
        req.headers['user-agent']
      );

    return res.status(200).json({
      status: 'success',
      message: result.message,
    });
  }),

  // ================= GOOGLE OAUTH SUCCESS =================
  oauthSuccess: catchAsync(async (req, res) => {
    // Passport failed to authenticate
    if (!req.user) {
      return res.redirect(
        `${process.env.FRONTEND_URL}/login?error=oauth_failed`
      );
    }

    const user = req.user;

    // Safety check
    if (!user || !user.email) {
      return res.redirect(
        `${process.env.FRONTEND_URL}/login?error=user_not_found`
      );
    }

    // Generate access token
    const accessToken = jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      process.env.JWT_ACCESS_SECRET,
      {
        expiresIn: '15m',
      }
    );

    // Generate refresh token
    const refreshToken = jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      process.env.JWT_REFRESH_SECRET,
      {
        expiresIn: '7d',
      }
    );

    // Store tokens in secure httpOnly cookies.
    // The JWT is NOT exposed in the URL.
    setCookies(
      res,
      accessToken,
      refreshToken
    );

    // Only send the role to the frontend.
    return res.redirect(
      `${process.env.FRONTEND_URL}/oauth-callback?role=${encodeURIComponent(
        user.role
      )}`
    );
  }),
};

export default authController;