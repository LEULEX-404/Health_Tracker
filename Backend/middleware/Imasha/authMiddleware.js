import { verifyAccessToken, extractTokenFromHeader } from '../../utils/Imasha/jwt.js';
import { UnauthorizedError, ForbiddenError } from '../../utils/Imasha/errors.js';
import { AUTH_MESSAGES, USER_ROLES } from '../../constants/Imasha/index.js';

/**
 * Middleware to authenticate user using JWT
 */
export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);
    
    if (!token) {
      throw new UnauthorizedError(AUTH_MESSAGES.UNAUTHORIZED_ACCESS);
    }
    
    const decoded = verifyAccessToken(token);
    
    // Attach user info to request
    req.user = {
      userId: decoded.userId,
      role: decoded.role,
    };
    
    next();
  } catch (error) {
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
