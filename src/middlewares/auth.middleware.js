import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import AppError from '../utils/AppError.js';
import catchAsync from '../utils/catchAsync.js'; // Note: utility wrapper will be created soon

export const protect = catchAsync(async (req, res, next) => {
  let token;

  // 1) Get token from authorization headers or cookies
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.accessToken) {
    token = req.cookies.accessToken;
  }

  if (!token) {
    return next(new AppError('You are not logged in! Please log in to get access.', 401));
  }

  // 2) Verify token
  const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET || 'your_super_secret_access_key_change_me_in_production');

  // 3) Check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(new AppError('The user belonging to this token no longer exists.', 401));
  }

  // 4) Check if user is suspended or pending
  if (currentUser.status !== 'Active') {
    return next(new AppError('Your account has been suspended or is not yet active. Please contact administrator.', 403));
  }

  // Grant access to protected route
  req.user = currentUser;
  next();
});

// Role-based authorization check
export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action', 403));
    }
    next();
  };
};
