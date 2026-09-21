import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import userRepository from '../repositories/user.repository.js';
import redisService from '../config/redis.js';
import emailService from './email.service.js';
import auditLogRepository from '../repositories/auditLog.repository.js';
import AppError from '../utils/AppError.js';

// ================= TOKENS =================
const signAccessToken = (userId) =>
  jwt.sign(
    { id: userId },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: process.env.JWT_ACCESS_EXPIRATION || '15m' }
  );

const signRefreshToken = (userId) =>
  jwt.sign(
    { id: userId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRATION || '7d' }
  );

// ================= AUTH SERVICE =================
export const authService = {

  // SIGNUP (send OTP)
  signUp: async (userData, ipAddress, userAgent) => {
    const existing = await userRepository.findByEmail(userData.email);
    if (existing) throw new AppError('Email already in use', 400);

    const user = await userRepository.create({
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      password: userData.password,
      role: userData.role || 'Student',
      isEmailVerified: false,
    });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await redisService.set(`otp:${user.email}`, otp, 600);
    await emailService.sendOtpEmail(user.email, otp);

    await auditLogRepository.logAction({
      userId: user._id,
      action: 'USER_SIGNUP',
      details: { email: user.email },
      ipAddress,
      userAgent,
    });

    user.password = undefined;
    return user;
  },

  // VERIFY OTP (NO tempToken anymore)
  verifyEmailOtp: async (email, otp) => {
    const user = await userRepository.findByEmail(email);
    if (!user) throw new AppError('User not found', 404);

    if (user.isEmailVerified) {
      throw new AppError('Email already verified', 400);
    }

    const savedOtp = await redisService.get(`otp:${email}`);

    if (!savedOtp) throw new AppError('OTP expired or invalid', 400);
    if (savedOtp !== otp) throw new AppError('Invalid OTP', 400);

    await redisService.del(`otp:${email}`);

    user.isEmailVerified = true;
    await user.save();

    const accessToken = signAccessToken(user._id);
    const refreshToken = signRefreshToken(user._id);

    const hashed = await bcrypt.hash(refreshToken, 10);

    await userRepository.update(user._id, {
      refreshTokenHash: hashed,
    });

    return { user, accessToken, refreshToken };
  },

  // LOGIN
  login: async ({ email, password }) => {
    const user = await userRepository.findOne({ email }, '', '+password');

    if (!user || !(await user.comparePassword(password))) {
      throw new AppError('Invalid credentials', 401);
    }

    if (!user.isEmailVerified) {
      throw new AppError('Please verify your email first', 403);
    }

    const accessToken = signAccessToken(user._id);
    const refreshToken = signRefreshToken(user._id);

    const hashed = await bcrypt.hash(refreshToken, 10);

    await userRepository.update(user._id, {
      refreshTokenHash: hashed,
    });

    return { user, accessToken, refreshToken };
  },
};

export default authService;