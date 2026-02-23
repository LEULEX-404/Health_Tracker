import { ApiError } from '../../utils/Imasha/errors.js';
import { HTTP_STATUS } from '../../constants/Imasha/index.js';

/**
 * Error handler middleware
 * Catches all errors and sends appropriate response
 */
export const errorHandler = (err, req, res, next) => {
  let error = err;
  
  // If error is not an instance of ApiError, convert it
  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
    const message = error.message || 'Internal server error';
    error = new ApiError(statusCode, message, false, err.stack);
  }
  
  // Log error
  if (process.env.NODE_ENV === 'development') {
    console.error('Error:', {
      message: error.message,
      statusCode: error.statusCode,
      stack: error.stack,
    });
  } else {
    console.error('Error:', {
      message: error.message,
      statusCode: error.statusCode,
    });
  }
  
  // Send error response
  const response = {
    success: false,
    message: error.message,
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
  };
  
  res.status(error.statusCode).json(response);
};

/**
 * Handle 404 Not Found errors
 */
export const notFound = (req, res, next) => {
  const error = new ApiError(
    HTTP_STATUS.NOT_FOUND,
    `Route ${req.originalUrl} not found`
  );
  next(error);
};

/**
 * Mongoose duplicate key error handler
 */
export const handleDuplicateKeyError = (err, req, res, next) => {
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    const error = new ApiError(
      HTTP_STATUS.CONFLICT,
      `${field} already exists`
    );
    return next(error);
  }
  next(err);
};

/**
 * Mongoose validation error handler
 */
export const handleValidationError = (err, req, res, next) => {
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => e.message);
    const error = new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      `Validation Error: ${errors.join(', ')}`
    );
    return next(error);
  }
  next(err);
};

/**
 * Mongoose cast error handler (invalid ObjectId)
 */
export const handleCastError = (err, req, res, next) => {
  if (err.name === 'CastError') {
    const error = new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      `Invalid ${err.path}: ${err.value}`
    );
    return next(error);
  }
  next(err);
};
