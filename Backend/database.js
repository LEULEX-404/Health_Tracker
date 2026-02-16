import mongoose from 'mongoose';
import { MONGO_URI, NODE_ENV } from './config.js';

/**
 * MongoDB Connection Configuration
 * Connects to MongoDB database with proper error handling and connection events
 */

/**
 * Connect to MongoDB database
 * @returns {Promise<void>}
 */
export const connectDB = async () => {
  try {
    // MongoDB connection options
    const options = {
      // Connection pool size - max number of connections
      maxPoolSize: 10,
      
      // Timeout for initial connection attempt
      serverSelectionTimeoutMS: 5000,
      
      // Timeout for socket operations
      socketTimeoutMS: 45000,
    };

    // Attempt to connect to MongoDB
    const conn = await mongoose.connect(MONGO_URI, options);
    
    // Log successful connection
    console.log('MongoDB Connected Successfully!');
    console.log(`Host: ${conn.connection.host}`);
    console.log(`Database: ${conn.connection.name}`);
    console.log(`Environment: ${NODE_ENV}`);
    
    // Set up connection event handlers
    setupConnectionHandlers();
    
    // Set up graceful shutdown
    setupGracefulShutdown();
    
  } catch (error) {
    console.error('❌ MongoDB Connection Failed!');
    console.error(`Error: ${error.message}`);
    
    // Exit process with failure
    process.exit(1);
  }
};

/**
 * Set up MongoDB connection event handlers
 */
const setupConnectionHandlers = () => {
  // Handle connection errors after initial connection
  mongoose.connection.on('error', (err) => {
    console.error('❌ MongoDB connection error:', err);
    
    // Log additional details in development
    if (NODE_ENV === 'development') {
      console.error('Error details:', err);
    }
  });

  // Handle disconnection
  mongoose.connection.on('disconnected', () => {
    console.log('⚠️  MongoDB disconnected');
    console.log('🔄 Attempting to reconnect...');
  });

  // Handle reconnection
  mongoose.connection.on('reconnected', () => {
    console.log('✅ MongoDB reconnected successfully');
  });

  // Handle connection close
  mongoose.connection.on('close', () => {
    console.log('🔒 MongoDB connection closed');
  });
};

/**
 * Set up graceful shutdown handlers
 * Ensures database connections are closed properly when the app terminates
 */
const setupGracefulShutdown = () => {
  // Handle SIGINT (Ctrl+C)
  process.on('SIGINT', async () => {
    console.log('\n⚠️  SIGINT signal received: closing MongoDB connection');
    await gracefulShutdown('SIGINT');
  });

  // Handle SIGTERM (kill command)
  process.on('SIGTERM', async () => {
    console.log('\n⚠️  SIGTERM signal received: closing MongoDB connection');
    await gracefulShutdown('SIGTERM');
  });

  // Handle uncaught exceptions
  process.on('uncaughtException', async (err) => {
    console.error('❌ Uncaught Exception:', err);
    await gracefulShutdown('uncaughtException');
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', async (err) => {
    console.error('❌ Unhandled Promise Rejection:', err);
    await gracefulShutdown('unhandledRejection');
  });
};

/**
 * Gracefully shutdown the database connection
 * @param {string} signal - The signal that triggered the shutdown
 */
const gracefulShutdown = async (signal) => {
  try {
    await mongoose.connection.close();
    console.log(`✅ MongoDB connection closed through ${signal}`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during graceful shutdown:', error);
    process.exit(1);
  }
};

/**
 * Disconnect from MongoDB
 * @returns {Promise<void>}
 */
export const disconnectDB = async () => {
  try {
    await mongoose.connection.close();
    console.log('✅ MongoDB disconnected successfully');
  } catch (error) {
    console.error('❌ Error disconnecting from MongoDB:', error.message);
    throw error;
  }
};

/**
 * Check if MongoDB is connected
 * @returns {boolean}
 */
export const isConnected = () => {
  return mongoose.connection.readyState === 1;
};

/**
 * Get MongoDB connection state
 * @returns {string} Connection state (disconnected, connected, connecting, disconnecting)
 */
export const getConnectionState = () => {
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };
  
  return states[mongoose.connection.readyState] || 'unknown';
};

/**
 * Get database statistics
 * @returns {Promise<Object>} Database statistics
 */
export const getDatabaseStats = async () => {
  try {
    if (!isConnected()) {
      throw new Error('Database is not connected');
    }

    const stats = await mongoose.connection.db.stats();
    
    return {
      database: mongoose.connection.name,
      collections: stats.collections,
      dataSize: `${(stats.dataSize / 1024 / 1024).toFixed(2)} MB`,
      storageSize: `${(stats.storageSize / 1024 / 1024).toFixed(2)} MB`,
      indexes: stats.indexes,
      indexSize: `${(stats.indexSize / 1024 / 1024).toFixed(2)} MB`,
    };
  } catch (error) {
    console.error('Error getting database stats:', error);
    throw error;
  }
};

// Export the mongoose instance for use in other files
export default mongoose;