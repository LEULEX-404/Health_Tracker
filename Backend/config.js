import dotenv from "dotenv";

dotenv.config();

export const PORT = process.env.PORT;
export const MONGO_URI = process.env.MONGO_URI;
export const NODE_ENV = process.env.NODE_ENV || 'development';

// ==========================================
// JWT CONFIGURATION
// ==========================================
export const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret-key-change-in-production';
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
export const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'your-refresh-token-secret-key-change-in-production';
export const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';

// ==========================================
// GOOGLE OAUTH CONFIGURATION
// ==========================================
export const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
export const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';
export const GOOGLE_CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback';

// ==========================================
// EMAIL CONFIGURATION (NODEMAILER)
// ==========================================
export const EMAIL_HOST = process.env.EMAIL_HOST || 'smtp.gmail.com';
export const EMAIL_PORT = process.env.EMAIL_PORT || 587;
export const EMAIL_USER = process.env.EMAIL_USER || '';
export const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD || '';
export const EMAIL_FROM = process.env.EMAIL_FROM || 'noreply@healthcare.com';

// ==========================================
// FRONTEND URLS
// ==========================================
export const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';
export const ADMIN_DASHBOARD_URL = process.env.ADMIN_DASHBOARD_URL || 'http://localhost:3000/admin/dashboard';
export const PATIENT_HOME_URL = process.env.PATIENT_HOME_URL || 'http://localhost:3000/home';

// ==========================================
// SECURITY CONFIGURATION
// ==========================================
export const MAX_LOGIN_ATTEMPTS = parseInt(process.env.MAX_LOGIN_ATTEMPTS) || 5;
export const LOGIN_ATTEMPT_WINDOW = parseInt(process.env.LOGIN_ATTEMPT_WINDOW) || 15; // minutes
export const ACCOUNT_LOCK_DURATION = parseInt(process.env.ACCOUNT_LOCK_DURATION) || 30; // minutes
export const BCRYPT_SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;

// ==========================================
// COOKIE CONFIGURATION
// ==========================================
export const COOKIE_SECRET = process.env.COOKIE_SECRET || 'your-cookie-secret-key';
export const COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

// ==========================================
// CORS CONFIGURATION
// ==========================================
export const CORS_ORIGIN = process.env.CORS_ORIGIN || CLIENT_URL;

// ==========================================
// VALIDATION
// ==========================================
// Validate required environment variables in production
if (NODE_ENV === 'production') {
  const requiredEnvVars = [
    'MONGO_URI',
    'JWT_SECRET',
    'REFRESH_TOKEN_SECRET',
    'EMAIL_USER',
    'EMAIL_PASSWORD',
  ];

  const missingEnvVars = requiredEnvVars.filter(
    (envVar) => !process.env[envVar]
  );

  if (missingEnvVars.length > 0) {
    console.error(
      `❌ Missing required environment variables: ${missingEnvVars.join(', ')}`
    );
    console.error('Please set these variables in your .env file');
    process.exit(1);
  }
}

// ==========================================
// EXPORT ALL CONFIGURATION
// ==========================================
export default {
  // Server
  PORT,
  NODE_ENV,
  
  // Database
  MONGO_URI,
  
  // JWT
  JWT_SECRET,
  JWT_EXPIRES_IN,
  REFRESH_TOKEN_SECRET,
  REFRESH_TOKEN_EXPIRES_IN,
  
  // Google OAuth
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_CALLBACK_URL,
  
  // Email
  EMAIL_HOST,
  EMAIL_PORT,
  EMAIL_USER,
  EMAIL_PASSWORD,
  EMAIL_FROM,
  
  // Frontend URLs
  CLIENT_URL,
  ADMIN_DASHBOARD_URL,
  PATIENT_HOME_URL,
  
  // Security
  MAX_LOGIN_ATTEMPTS,
  LOGIN_ATTEMPT_WINDOW,
  ACCOUNT_LOCK_DURATION,
  BCRYPT_SALT_ROUNDS,
  
  // Cookie
  COOKIE_SECRET,
  COOKIE_MAX_AGE,
  
  // CORS
  CORS_ORIGIN,
};