import { verifyAccessToken, extractTokenFromHeader } from '../../utils/Imasha/jwt.js';
import { UnauthorizedError, ForbiddenError } from '../../utils/Imasha/errors.js';
import { AUTH_MESSAGES, USER_ROLES } from '../../constants/Imasha/index.js';
import jwt from 'jsonwebtoken';
import User from '../../models/Imasha/User.js';

/**
 * Middleware to authenticate user using JWT
 */
export const authenticate = async (req, res, next) => {
  try {
    //Get token from header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No token provided. Please login first.',
      });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token missing.',
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    console.log('Token decoded:', decoded); // Debug log

    //Find user in database
    const user = await User.findById(decoded.id || decoded._id || decoded.userId)
      .select('-password');

    console.log('User found:', user ? user.email : 'NOT FOUND'); // Debug log

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found. Token invalid.',
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated.',
      });
    }

    //Set req.user BEFORE calling next()
    req.user = user;

    //Call next AFTER req.user is set
    next();

  } catch (error) {
    console.error('Auth middleware error:', error.message);

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token.',
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired. Please login again.',
      });
    }

    next(error);
  }
};
/**
 * Middleware to authorize based on user roles
 * @param {...string} allowedRoles - Roles that are allowed to access the route
 */
export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        throw new UnauthorizedError(AUTH_MESSAGES.UNAUTHORIZED_ACCESS);
      }
      
      if (!allowedRoles.includes(req.user.role)) {
        throw new ForbiddenError('You do not have permission to access this resource');
      }
      
      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Middleware to check if user is admin
 */
export const isAdmin = authorize(USER_ROLES.ADMIN);

/**
 * Middleware to check if user is doctor
 */
export const isDoctor = authorize(USER_ROLES.DOCTOR);

/**
 * Middleware to check if user is patient
 */
export const isPatient = authorize(USER_ROLES.PATIENT);

/**
 * Middleware to check if user is caregiver
 */
export const isCaregiver = authorize(USER_ROLES.CAREGIVER);

/**
 * Middleware to check if user is admin or doctor
 */
export const isAdminOrDoctor = authorize(USER_ROLES.ADMIN, USER_ROLES.DOCTOR);

/**
 * Middleware to check if user is patient or caregiver
 */
export const isPatientOrCaregiver = authorize(USER_ROLES.PATIENT, USER_ROLES.CAREGIVER);

/**
 * Optional authentication - doesn't throw error if no token
 * Useful for routes that work for both authenticated and non-authenticated users
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);
    
    if (token) {
      const decoded = verifyAccessToken(token);
      req.user = {
        userId: decoded.userId,
        role: decoded.role,
      };
    }
    
    next();
  } catch (error) {
    // Don't throw error for optional auth
    next();
  }
};
