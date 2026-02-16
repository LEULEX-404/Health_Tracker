import User from '../../models/Imasha/User.js';
import RefreshToken from '../../models/Imasha/RefreshToken.js';
import LoginAttempt from '../../models/Imasha/LoginAttempt.js';
import AuditLog from '../../models/Imasha/AuditLog.js';
import {
  generateAccessToken,
  generateRefreshToken,
  generateEmailVerificationToken,
  generatePasswordResetToken,
  calculateExpirationDate,
  verifyRefreshToken,
} from '../../utils/Imasha/jwt.js';
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendAccountLockedEmail,
  sendWelcomeEmail,
} from './emailService.js';
import {
  validateRegistrationInput,
  validateLoginInput,
  sanitizeInput,
} from '../../utils/Imasha/validation.js';
import {
  BadRequestError,
  UnauthorizedError,
  ConflictError,
  NotFoundError,
  TooManyRequestsError,
} from '../../utils/Imasha/errors.js';
import {
  AUTH_MESSAGES,
  USER_ROLES,
  AUDIT_ACTIONS,
  SECURITY,
} from '../../constants/Imasha/index.js';

/**
 * Authentication Service
 * Handles all authentication-related business logic
 */
class AuthService {
  /**
   * Register a new patient
   */
  async registerPatient(userData, ipAddress) {
    try {
      // Sanitize input
      const sanitizedData = sanitizeInput(userData);
      
      // Validate input
      validateRegistrationInput(sanitizedData);
      
      const { firstName, lastName, email, password, phone, dateOfBirth, gender } = sanitizedData;
      
      // Check if user already exists
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        throw new ConflictError(AUTH_MESSAGES.EMAIL_ALREADY_EXISTS);
      }
      
      // Generate email verification token
      const emailVerificationToken = generateEmailVerificationToken();
      
      // Create new user
      const user = new User({
        firstName,
        lastName,
        email: email.toLowerCase(),
        password,
        phone,
        dateOfBirth,
        gender,
        role: USER_ROLES.PATIENT,
        emailVerificationToken,
        isEmailVerified: false,
        lastLoginIP: ipAddress,
      });
      
      await user.save();
      
      // Send verification email
      await sendVerificationEmail(email, firstName, emailVerificationToken);
      
      // Create audit log
      await this.createAuditLog({
        userId: user._id,
        action: AUDIT_ACTIONS.USER_REGISTERED,
        description: `Patient registered: ${email}`,
        ipAddress,
        status: 'success',
      });
      
      return {
        message: AUTH_MESSAGES.REGISTRATION_SUCCESS,
        userId: user._id,
      };
    } catch (error) {
      throw error;
    }
  }
  
  /**
   * Login user (admin or patient)
   */
  async login(credentials, ipAddress, userAgent) {
    try {
      // Sanitize and validate input
      const sanitizedCredentials = sanitizeInput(credentials);
      validateLoginInput(sanitizedCredentials);
      
      const { email, password } = sanitizedCredentials;
      const normalizedEmail = email.toLowerCase();
      
      // Check for account lockout
      await this.checkAccountLockout(normalizedEmail, ipAddress);
      
      // Find user
      const user = await User.findOne({ 
        email: normalizedEmail,
        isDeleted: false,
      });
      
      if (!user) {
        await this.recordFailedLogin(normalizedEmail, ipAddress);
        throw new UnauthorizedError(AUTH_MESSAGES.INVALID_CREDENTIALS);
      }
      
      // Check if account is active
      if (!user.isActive) {
        throw new UnauthorizedError(AUTH_MESSAGES.ACCOUNT_INACTIVE);
      }
      
      // Verify password
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        await this.recordFailedLogin(normalizedEmail, ipAddress);
        throw new UnauthorizedError(AUTH_MESSAGES.INVALID_CREDENTIALS);
      }
      
      // Check email verification
      if (!user.isEmailVerified) {
        throw new UnauthorizedError(AUTH_MESSAGES.ACCOUNT_NOT_VERIFIED);
      }
      
      // Generate tokens
      const accessToken = generateAccessToken(user._id, user.role);
      const refreshToken = generateRefreshToken(user._id);
      
      // Save refresh token to database
      await this.saveRefreshToken(user._id, refreshToken, ipAddress);
      
      // Update last login
      user.lastLoginAt = new Date();
      user.lastLoginIP = ipAddress;
      await user.save();
      
      // Record successful login
      await this.recordSuccessfulLogin(normalizedEmail, ipAddress);
      
      // Create audit log
      await this.createAuditLog({
        userId: user._id,
        action: AUDIT_ACTIONS.USER_LOGIN,
        description: `User logged in: ${email}`,
        ipAddress,
        userAgent,
        status: 'success',
      });
      
      // Determine redirect URL based on role
      const redirectUrl = user.role === USER_ROLES.ADMIN 
        ? process.env.ADMIN_DASHBOARD_URL 
        : process.env.PATIENT_HOME_URL;
      
      return {
        message: AUTH_MESSAGES.LOGIN_SUCCESS,
        accessToken,
        refreshToken,
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          profileImage: user.profileImage,
        },
        redirectUrl,
      };
    } catch (error) {
      throw error;
    }
  }
  
  /**
   * Logout user
   */
  async logout(userId, refreshToken, ipAddress) {
    try {
      // Revoke refresh token
      if (refreshToken) {
        await RefreshToken.findOneAndUpdate(
          { token: refreshToken, user: userId },
          { 
            isRevoked: true,
            revokedAt: new Date(),
            revokedByIP: ipAddress,
          }
        );
      }
      
      // Create audit log
      await this.createAuditLog({
        userId,
        action: AUDIT_ACTIONS.USER_LOGOUT,
        description: 'User logged out',
        ipAddress,
        status: 'success',
      });
      
      return {
        message: AUTH_MESSAGES.LOGOUT_SUCCESS,
      };
    } catch (error) {
      throw error;
    }
  }
  
  /**
   * Refresh access token
   */
  async refreshAccessToken(refreshToken, ipAddress) {
    try {
      // Verify refresh token
      const decoded = verifyRefreshToken(refreshToken);
      
      // Check if token exists in database and is not revoked
      const tokenDoc = await RefreshToken.findOne({
        token: refreshToken,
        user: decoded.userId,
        isRevoked: false,
      });
      
      if (!tokenDoc) {
        throw new UnauthorizedError(AUTH_MESSAGES.INVALID_REFRESH_TOKEN);
      }
      
      // Check if token is expired
      if (tokenDoc.expiresAt < new Date()) {
        throw new UnauthorizedError(AUTH_MESSAGES.TOKEN_EXPIRED);
      }
      
      // Get user
      const user = await User.findById(decoded.userId);
      if (!user || !user.isActive) {
        throw new UnauthorizedError(AUTH_MESSAGES.USER_NOT_FOUND);
      }
      
      // Generate new access token
      const newAccessToken = generateAccessToken(user._id, user.role);
      
      // Create audit log
      await this.createAuditLog({
        userId: user._id,
        action: AUDIT_ACTIONS.TOKEN_REFRESHED,
        description: 'Access token refreshed',
        ipAddress,
        status: 'success',
      });
      
      return {
        message: AUTH_MESSAGES.TOKEN_REFRESHED,
        accessToken: newAccessToken,
      };
    } catch (error) {
      throw error;
    }
  }
  
  /**
   * Verify email
   */
  async verifyEmail(token) {
    try {
      const user = await User.findOne({ emailVerificationToken: token });
      
      if (!user) {
        throw new BadRequestError(AUTH_MESSAGES.INVALID_TOKEN);
      }
      
      // Mark email as verified
      user.isEmailVerified = true;
      user.emailVerificationToken = undefined;
      await user.save();
      
      // Send welcome email
      await sendWelcomeEmail(user.email, user.firstName);
      
      // Create audit log
      await this.createAuditLog({
        userId: user._id,
        action: AUDIT_ACTIONS.EMAIL_VERIFIED,
        description: `Email verified: ${user.email}`,
        status: 'success',
      });
      
      return {
        message: AUTH_MESSAGES.EMAIL_VERIFIED,
      };
    } catch (error) {
      throw error;
    }
  }
  
  /**
   * Request password reset
   */
  async requestPasswordReset(email, ipAddress) {
    try {
      const user = await User.findOne({ 
        email: email.toLowerCase(),
        isDeleted: false,
      });
      
      // Don't reveal if user exists or not (security best practice)
      if (!user) {
        return {
          message: AUTH_MESSAGES.PASSWORD_RESET_EMAIL_SENT,
        };
      }
      
      // Generate password reset token
      const resetToken = generatePasswordResetToken();
      const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
      
      user.passwordResetToken = resetToken;
      user.passwordResetExpires = resetExpires;
      await user.save();
      
      // Send password reset email
      await sendPasswordResetEmail(user.email, user.firstName, resetToken);
      
      // Create audit log
      await this.createAuditLog({
        userId: user._id,
        action: AUDIT_ACTIONS.PASSWORD_RESET_REQUESTED,
        description: 'Password reset requested',
        ipAddress,
        status: 'success',
      });
      
      return {
        message: AUTH_MESSAGES.PASSWORD_RESET_EMAIL_SENT,
      };
    } catch (error) {
      throw error;
    }
  }
  
  /**
   * Reset password
   */
  async resetPassword(token, newPassword, ipAddress) {
    try {
      const user = await User.findOne({
        passwordResetToken: token,
        passwordResetExpires: { $gt: new Date() },
      });
      
      if (!user) {
        throw new BadRequestError(AUTH_MESSAGES.INVALID_TOKEN);
      }
      
      // Update password
      user.password = newPassword;
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save();
      
      // Revoke all refresh tokens
      await RefreshToken.updateMany(
        { user: user._id, isRevoked: false },
        { 
          isRevoked: true,
          revokedAt: new Date(),
          revokedByIP: ipAddress,
        }
      );
      
      // Create audit log
      await this.createAuditLog({
        userId: user._id,
        action: AUDIT_ACTIONS.PASSWORD_RESET_COMPLETED,
        description: 'Password reset completed',
        ipAddress,
        status: 'success',
      });
      
      return {
        message: AUTH_MESSAGES.PASSWORD_RESET_SUCCESS,
      };
    } catch (error) {
      throw error;
    }
  }
  
  /**
   * Save refresh token to database
   */
  async saveRefreshToken(userId, token, ipAddress) {
    const expiresAt = calculateExpirationDate(
      process.env.REFRESH_TOKEN_EXPIRES_IN || '7d'
    );
    
    const refreshToken = new RefreshToken({
      user: userId,
      token,
      expiresAt,
      createdByIP: ipAddress,
    });
    
    await refreshToken.save();
  }
  
  /**
   * Check if account is locked due to multiple failed login attempts
   */
  async checkAccountLockout(email, ipAddress) {
    const windowStart = new Date(
      Date.now() - SECURITY.ACCOUNT_LOCK_DURATION_MINUTES * 60 * 1000
    );
    
    const recentAttempts = await LoginAttempt.find({
      email,
      success: false,
      attemptTime: { $gte: windowStart },
    }).sort({ attemptTime: -1 });
    
    if (recentAttempts.length >= SECURITY.MAX_LOGIN_ATTEMPTS) {
      // Check if the most recent attempt was within lock duration
      const lastAttempt = recentAttempts[0];
      const lockUntil = new Date(
        lastAttempt.attemptTime.getTime() + 
        SECURITY.ACCOUNT_LOCK_DURATION_MINUTES * 60 * 1000
      );
      
      if (new Date() < lockUntil) {
        const user = await User.findOne({ email });
        if (user) {
          // Send account locked email (only once)
          if (recentAttempts.length === SECURITY.MAX_LOGIN_ATTEMPTS) {
            await sendAccountLockedEmail(user.email, user.firstName);
            
            await this.createAuditLog({
              userId: user._id,
              action: AUDIT_ACTIONS.ACCOUNT_LOCKED,
              description: 'Account locked due to multiple failed login attempts',
              ipAddress,
              status: 'failure',
            });
          }
        }
        
        throw new TooManyRequestsError(AUTH_MESSAGES.ACCOUNT_LOCKED);
      }
    }
  }
  
  /**
   * Record failed login attempt
   */
  async recordFailedLogin(email, ipAddress) {
    const loginAttempt = new LoginAttempt({
      email,
      ipAddress,
      success: false,
    });
    
    await loginAttempt.save();
    
    // Create audit log
    await this.createAuditLog({
      action: AUDIT_ACTIONS.USER_LOGIN_FAILED,
      description: `Failed login attempt: ${email}`,
      ipAddress,
      status: 'failure',
      metadata: { email },
    });
  }
  
  /**
   * Record successful login attempt
   */
  async recordSuccessfulLogin(email, ipAddress) {
    const loginAttempt = new LoginAttempt({
      email,
      ipAddress,
      success: true,
    });
    
    await loginAttempt.save();
  }
  
  /**
   * Create audit log entry
   */
  async createAuditLog(logData) {
    try {
      const auditLog = new AuditLog(logData);
      await auditLog.save();
    } catch (error) {
      console.error('Error creating audit log:', error);
      // Don't throw error - audit log failure shouldn't break the flow
    }
  }
}

export default new AuthService();
