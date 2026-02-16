import { OAuth2Client } from 'google-auth-library';
import User from '../../models/Imasha/User.js';
import AuditLog from '../../models/Imasha/AuditLog.js';
import {
  generateAccessToken,
  generateRefreshToken,
} from '../../utils/Imasha/jwt.js';
import {
  UnauthorizedError,
  InternalServerError,
} from '../../utils/Imasha/errors.js';
import {
  AUTH_MESSAGES,
  USER_ROLES,
  AUDIT_ACTIONS,
} from '../../constants/Imasha/index.js';
import authService from './authService.js';

/**
 * Google OAuth Service
 * Handles Google authentication
 */
class GoogleAuthService {
  constructor() {
    this.client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_CALLBACK_URL
    );
  }
  
  /**
   * Get Google OAuth URL
   */
  getAuthUrl() {
    const scopes = [
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile',
    ];
    
    return this.client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent',
    });
  }
  
  /**
   * Verify Google token and get user info
   */
  async verifyGoogleToken(code, ipAddress, userAgent) {
    try {
      // Exchange code for tokens
      const { tokens } = await this.client.getToken(code);
      this.client.setCredentials(tokens);
      
      // Verify ID token
      const ticket = await this.client.verifyIdToken({
        idToken: tokens.id_token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      
      const payload = ticket.getPayload();
      
      // Extract user info
      const googleId = payload.sub;
      const email = payload.email;
      const firstName = payload.given_name || '';
      const lastName = payload.family_name || '';
      const profileImage = payload.picture || '';
      const isEmailVerified = payload.email_verified || false;
      
      // Find or create user
      let user = await User.findOne({ 
        $or: [
          { googleId },
          { email: email.toLowerCase() }
        ]
      });
      
      if (user) {
        // Update existing user
        if (!user.googleId) {
          user.googleId = googleId;
        }
        
        if (!user.isEmailVerified && isEmailVerified) {
          user.isEmailVerified = true;
        }
        
        if (!user.profileImage && profileImage) {
          user.profileImage = profileImage;
        }
        
        user.lastLoginAt = new Date();
        user.lastLoginIP = ipAddress;
        await user.save();
      } else {
        // Create new user
        user = new User({
          googleId,
          email: email.toLowerCase(),
          firstName,
          lastName,
          profileImage,
          role: USER_ROLES.PATIENT,
          isEmailVerified,
          isActive: true,
          lastLoginAt: new Date(),
          lastLoginIP: ipAddress,
        });
        
        await user.save();
      }
      
      // Check if account is active
      if (!user.isActive) {
        throw new UnauthorizedError(AUTH_MESSAGES.ACCOUNT_INACTIVE);
      }
      
      // Generate tokens
      const accessToken = generateAccessToken(user._id, user.role);
      const refreshToken = generateRefreshToken(user._id);
      
      // Save refresh token
      await authService.saveRefreshToken(user._id, refreshToken, ipAddress);
      
      // Create audit log
      await this.createAuditLog({
        userId: user._id,
        action: AUDIT_ACTIONS.GOOGLE_LOGIN,
        description: `User logged in via Google: ${email}`,
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
      console.error('Google authentication error:', error);
      
      if (error instanceof UnauthorizedError) {
        throw error;
      }
      
      throw new InternalServerError(AUTH_MESSAGES.GOOGLE_AUTH_FAILED);
    }
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
    }
  }
}

export default new GoogleAuthService();
