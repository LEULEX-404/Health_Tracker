// User Roles
export const USER_ROLES = {
  ADMIN: 'admin',
  DOCTOR: 'doctor',
  PATIENT: 'patient',
  CAREGIVER: 'caregiver',
};

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
};

// Authentication Messages
export const AUTH_MESSAGES = {
  // Success Messages
  REGISTRATION_SUCCESS: 'Registration successful! Please check your email to verify your account.',
  LOGIN_SUCCESS: 'Login successful!',
  LOGOUT_SUCCESS: 'Logout successful!',
  EMAIL_VERIFIED: 'Email verified successfully! You can now login.',
  PASSWORD_RESET_EMAIL_SENT: 'Password reset link has been sent to your email.',
  PASSWORD_RESET_SUCCESS: 'Password has been reset successfully!',
  TOKEN_REFRESHED: 'Token refreshed successfully!',
  
  // Error Messages
  EMAIL_ALREADY_EXISTS: 'An account with this email already exists.',
  INVALID_CREDENTIALS: 'Invalid email or password.',
  USER_NOT_FOUND: 'User not found.',
  ACCOUNT_NOT_VERIFIED: 'Please verify your email before logging in.',
  ACCOUNT_INACTIVE: 'Your account has been deactivated. Please contact support.',
  ACCOUNT_LOCKED: 'Your account has been temporarily locked due to multiple failed login attempts. Please try again after 30 minutes.',
  INVALID_TOKEN: 'Invalid or expired token.',
  TOKEN_EXPIRED: 'Token has expired. Please login again.',
  INVALID_REFRESH_TOKEN: 'Invalid refresh token.',
  EMAIL_VERIFICATION_REQUIRED: 'Email verification required.',
  PASSWORD_REQUIRED: 'Password is required.',
  GOOGLE_AUTH_FAILED: 'Google authentication failed.',
  UNAUTHORIZED_ACCESS: 'Unauthorized access.',
  INVALID_ROLE: 'Invalid user role.',
  ADMIN_REGISTRATION_NOT_ALLOWED: 'Admin registration through this endpoint is not allowed.',
  
  // Validation Messages
  INVALID_EMAIL: 'Please provide a valid email address.',
  WEAK_PASSWORD: 'Password must be at least 8 characters long and contain uppercase, lowercase, number, and special character.',
  FIELDS_REQUIRED: 'Please provide all required fields.',
};

// Audit Log Actions
export const AUDIT_ACTIONS = {
  USER_REGISTERED: 'USER_REGISTERED',
  USER_LOGIN: 'USER_LOGIN',
  USER_LOGOUT: 'USER_LOGOUT',
  USER_LOGIN_FAILED: 'USER_LOGIN_FAILED',
  GOOGLE_LOGIN: 'GOOGLE_LOGIN',
  EMAIL_VERIFIED: 'EMAIL_VERIFIED',
  PASSWORD_RESET_REQUESTED: 'PASSWORD_RESET_REQUESTED',
  PASSWORD_RESET_COMPLETED: 'PASSWORD_RESET_COMPLETED',
  TOKEN_REFRESHED: 'TOKEN_REFRESHED',
  ACCOUNT_LOCKED: 'ACCOUNT_LOCKED',
};

// Email Templates
export const EMAIL_SUBJECTS = {
  VERIFY_EMAIL: 'Verify Your Email - Healthcare System',
  PASSWORD_RESET: 'Password Reset Request - Healthcare System',
  ACCOUNT_LOCKED: 'Account Security Alert - Healthcare System',
  WELCOME: 'Welcome to Healthcare System',
};

// Token Types
export const TOKEN_TYPES = {
  ACCESS: 'access',
  REFRESH: 'refresh',
  EMAIL_VERIFICATION: 'email_verification',
  PASSWORD_RESET: 'password_reset',
};

// Security Settings
export const SECURITY = {
  MAX_LOGIN_ATTEMPTS: 5,
  LOGIN_ATTEMPT_WINDOW_MINUTES: 15,
  ACCOUNT_LOCK_DURATION_MINUTES: 30,
  BCRYPT_SALT_ROUNDS: 12,
  PASSWORD_MIN_LENGTH: 8,
};

// Regex Patterns
export const REGEX = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  PHONE: /^\+?[\d\s-()]+$/,
};
