import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { UnauthorizedError } from './errors.js';
import { AUTH_MESSAGES, TOKEN_TYPES } from '../../constants/Imasha/index.js';

/**
 * Generates JWT access token
 */
export const generateAccessToken = (userId, role) => {
  const payload = {
    userId,
    role,
    type: TOKEN_TYPES.ACCESS,
  };
  
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
  });
};

/**
 * Generates JWT refresh token
 */
export const generateRefreshToken = (userId) => {
  const payload = {
    userId,
    type: TOKEN_TYPES.REFRESH,
  };
  
  return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',
  });
};

/**
 * Generates email verification token
 */
export const generateEmailVerificationToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

/**
 * Generates password reset token
 */
export const generatePasswordResetToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

/**
 * Verifies JWT access token
 */
export const verifyAccessToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (decoded.type !== TOKEN_TYPES.ACCESS) {
      throw new UnauthorizedError(AUTH_MESSAGES.INVALID_TOKEN);
    }
    
    return decoded;
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new UnauthorizedError(AUTH_MESSAGES.TOKEN_EXPIRED);
    }
    throw new UnauthorizedError(AUTH_MESSAGES.INVALID_TOKEN);
  }
};

/**
 * Verifies JWT refresh token
 */
export const verifyRefreshToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
    
    if (decoded.type !== TOKEN_TYPES.REFRESH) {
      throw new UnauthorizedError(AUTH_MESSAGES.INVALID_REFRESH_TOKEN);
    }
    
    return decoded;
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new UnauthorizedError(AUTH_MESSAGES.TOKEN_EXPIRED);
    }
    throw new UnauthorizedError(AUTH_MESSAGES.INVALID_REFRESH_TOKEN);
  }
};

/**
 * Extracts token from Authorization header
 */
export const extractTokenFromHeader = (authHeader) => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  return authHeader.substring(7); // Remove 'Bearer ' prefix
};

/**
 * Calculates token expiration date
 */
export const calculateExpirationDate = (expiresIn) => {
  // Parse expiresIn (e.g., '7d', '15m', '1h')
  const timeValue = parseInt(expiresIn);
  const timeUnit = expiresIn.slice(-1);
  
  const now = new Date();
  
  switch (timeUnit) {
    case 'd':
      return new Date(now.getTime() + timeValue * 24 * 60 * 60 * 1000);
    case 'h':
      return new Date(now.getTime() + timeValue * 60 * 60 * 1000);
    case 'm':
      return new Date(now.getTime() + timeValue * 60 * 1000);
    case 's':
      return new Date(now.getTime() + timeValue * 1000);
    default:
      return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // Default 7 days
  }
};
