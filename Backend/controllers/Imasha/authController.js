import authService from '../../services/Imasha/authService.js';
import googleAuthService from '../../services/Imasha/googleAuthService.js';
import { HTTP_STATUS } from '../../constants/Imasha/index.js';

/**
 * Authentication Controller
 * Handles HTTP requests for authentication
 */
class AuthController {
  /**
   * Register a new patient
   * POST /api/auth/register
   */
  async register(req, res, next) {
    try {
      const userData = req.body;
      const ipAddress = req.ip || req.connection.remoteAddress;
      
      const result = await authService.registerPatient(userData, ipAddress);
      
      res.status(HTTP_STATUS.CREATED).json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Login user (admin or patient)
   * POST /api/auth/login
   */
  async login(req, res, next) {
    try {
      const credentials = req.body;
      const ipAddress = req.ip || req.connection.remoteAddress;
      const userAgent = req.headers['user-agent'];
      
      const result = await authService.login(credentials, ipAddress, userAgent);
      
      // Set refresh token in HTTP-only cookie
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });
      
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: result.message,
        accessToken: result.accessToken,
        user: result.user,
        redirectUrl: result.redirectUrl,
      });
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Logout user
   * POST /api/auth/logout
   */
  async logout(req, res, next) {
    try {
      const userId = req.user.userId;
      const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
      const ipAddress = req.ip || req.connection.remoteAddress;
      
      const result = await authService.logout(userId, refreshToken, ipAddress);
      
      // Clear refresh token cookie
      res.clearCookie('refreshToken');
      
      res.status(HTTP_STATUS.OK).json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Refresh access token
   * POST /api/auth/refresh
   */
  async refreshToken(req, res, next) {
    try {
      const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
      const ipAddress = req.ip || req.connection.remoteAddress;
      
      if (!refreshToken) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          message: 'Refresh token is required',
        });
      }
      
      const result = await authService.refreshAccessToken(refreshToken, ipAddress);
      
      res.status(HTTP_STATUS.OK).json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Verify email
   * GET /api/auth/verify-email/:token
   */
  async verifyEmail(req, res, next) {
    try {
      const { token } = req.params;
      
      const result = await authService.verifyEmail(token);
      
      res.status(HTTP_STATUS.OK).json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Request password reset
   * POST /api/auth/forgot-password
   */
  async forgotPassword(req, res, next) {
    try {
      const { email } = req.body;
      const ipAddress = req.ip || req.connection.remoteAddress;
      
      const result = await authService.requestPasswordReset(email, ipAddress);
      
      res.status(HTTP_STATUS.OK).json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Reset password
   * POST /api/auth/reset-password
   */
  async resetPassword(req, res, next) {
    try {
      const { token, password } = req.body;
      const ipAddress = req.ip || req.connection.remoteAddress;
      
      const result = await authService.resetPassword(token, password, ipAddress);
      
      res.status(HTTP_STATUS.OK).json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Initiate Google OAuth
   * GET /api/auth/google
   */
  async googleAuth(req, res, next) {
    try {
      const authUrl = googleAuthService.getAuthUrl();
      res.redirect(authUrl);
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Google OAuth callback
   * GET /api/auth/google/callback
   */
  async googleCallback(req, res, next) {
  try {
    console.log('🔄 Google callback received');
    console.log('Query:', req.query);
    
    const { code, error } = req.query;
    
    if (error) {
      console.error('❌ Google error:', error);
      return res.redirect(`${process.env.CLIENT_URL}/login?error=${error}`);
    }
    
    if (!code) {
      console.error('❌ No code from Google');
      return res.redirect(`${process.env.CLIENT_URL}/login?error=no_code`);
    }
    
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];
    
    console.log('🔄 Verifying with Google...');
    const result = await googleAuthService.verifyGoogleToken(code, ipAddress, userAgent);
    
    console.log('✅ Success! User:', result.user.email);
    
    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    
    res.redirect(
      `${result.redirectUrl}?token=${result.accessToken}&user=${encodeURIComponent(JSON.stringify(result.user))}`
    );
  } catch (error) {
    console.error('❌ CALLBACK ERROR:');
    console.error('Message:', error.message);
    console.error('Full error:', error);
    res.redirect(`${process.env.CLIENT_URL}/login?error=google_auth_failed`);
  }
}
  
  /**
   * Get current user
   * GET /api/auth/me
   */
  async getCurrentUser(req, res, next) {
    try {
      const userId = req.user.userId;
      const User = (await import('../models/User.js')).default;
      
      const user = await User.findById(userId).select('-password -emailVerificationToken -passwordResetToken');
      
      if (!user) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          message: 'User not found',
        });
      }
      
      res.status(HTTP_STATUS.OK).json({
        success: true,
        user,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new AuthController();
