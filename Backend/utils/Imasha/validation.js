import { REGEX, AUTH_MESSAGES } from '../../constants/Imasha/index.js';
import { BadRequestError } from './errors.js';

/**
 * Validates email format
 */
export const validateEmail = (email) => {
  if (!email) {
    throw new BadRequestError(AUTH_MESSAGES.FIELDS_REQUIRED);
  }
  
  if (!REGEX.EMAIL.test(email)) {
    throw new BadRequestError(AUTH_MESSAGES.INVALID_EMAIL);
  }
  
  return true;
};

/**
 * Validates password strength
 * Requirements:
 * - At least 8 characters
 * - Contains uppercase letter
 * - Contains lowercase letter
 * - Contains number
 * - Contains special character
 */
export const validatePassword = (password) => {
  if (!password) {
    throw new BadRequestError(AUTH_MESSAGES.PASSWORD_REQUIRED);
  }
  
  if (!REGEX.PASSWORD.test(password)) {
    throw new BadRequestError(AUTH_MESSAGES.WEAK_PASSWORD);
  }
  
  return true;
};

/**
 * Validates registration input
 */
export const validateRegistrationInput = ({ firstName, lastName, email, password }) => {
  // Check required fields
  if (!firstName || !lastName || !email || !password) {
    throw new BadRequestError(AUTH_MESSAGES.FIELDS_REQUIRED);
  }
  
  // Validate email
  validateEmail(email);
  
  // Validate password
  validatePassword(password);
  
  // Validate names
  if (firstName.trim().length < 2 || lastName.trim().length < 2) {
    throw new BadRequestError('First name and last name must be at least 2 characters long.');
  }
  
  return true;
};

/**
 * Validates login input
 */
export const validateLoginInput = ({ email, password }) => {
  if (!email || !password) {
    throw new BadRequestError(AUTH_MESSAGES.FIELDS_REQUIRED);
  }
  
  validateEmail(email);
  
  return true;
};

/**
 * Sanitizes user input by trimming whitespace
 */
export const sanitizeInput = (input) => {
  if (typeof input === 'string') {
    return input.trim();
  }
  
  if (typeof input === 'object' && input !== null) {
    const sanitized = {};
    for (const [key, value] of Object.entries(input)) {
      sanitized[key] = typeof value === 'string' ? value.trim() : value;
    }
    return sanitized;
  }
  
  return input;
};

/**
 * Validates phone number format
 */
export const validatePhone = (phone) => {
  if (phone && !REGEX.PHONE.test(phone)) {
    throw new BadRequestError('Invalid phone number format.');
  }
  return true;
};
