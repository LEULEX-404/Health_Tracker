import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import path from "path";
import { fileURLToPath } from "url";
import { connectDB } from './database.js';
import { PORT, NODE_ENV, CLIENT_URL, ADMIN_DASHBOARD_URL, COOKIE_SECRET } from './config.js';
import authRoutes from './routes/Imasha/authRoutes.js';
import userRoutes from './routes/Imasha/userRoutes.js';
import userReportRoutes from './routes/Imasha/reportRoutes.js';
import adminRoutes from './routes/Imasha/adminRoutes.js';
import {
  errorHandler,
  notFound,
  handleDuplicateKeyError,
  handleValidationError,
  handleCastError,
} from './middleware/Imasha/errorMiddleware.js';


// ─────────────────────────────────────────────
// ROUTES
// ─────────────────────────────────────────────
import healthDataRoutes from "./routes/Tharuka/healthDataRoutes.js";
import simulatorRoutes from "./routes/Tharuka/simulatorRoutes.js";
import reportRoutes from "./routes/Tharuka/reportRoutes.js";
import nutritionRoutes from "./routes/Tharuka/nutritionRoutes.js";
import mealPlanRoutes from "./routes/Tharuka/mealPlanRoutes.js";
import mealReminderRoutes from "./routes/Tharuka/mealReminderRoutes.js";

// ─────────────────────────────────────────────
// SERVICES
// ─────────────────────────────────────────────
import simulatorService from "./services/Tharuka/simulatorService.js";
const { runSimulator } = simulatorService;

import reminderService from "./services/Tharuka/reminderService.js";

import User from "./models/Imasha/User.js";
import swaggerUi from 'swagger-ui-express';
import imashaOpenApi from './docs/imasha-openapi.js';

// ─────────────────────────────────────────────
// ES MODULE __dirname FIX
// ─────────────────────────────────────────────
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ==========================================
// CREATE EXPRESS APP
// ==========================================
const app = express();

// ==========================================
// CONNECT TO DATABASE
// ==========================================
connectDB();

// ==========================================
// SECURITY MIDDLEWARE
// ==========================================
// Helmet helps secure Express apps by setting various HTTP headers
app.use(helmet({
  contentSecurityPolicy: NODE_ENV === 'production' ? undefined : false,
  crossOriginEmbedderPolicy: false,
}));

// ==========================================
// CORS CONFIGURATION
// ==========================================
app.use(cors({
  origin: [CLIENT_URL, ADMIN_DASHBOARD_URL],
  credentials: true, // Allow cookies to be sent
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ==========================================
// BODY PARSING MIDDLEWARE
// ==========================================
app.use(express.json({ limit: '10mb' })); // Parse JSON bodies
app.use(express.urlencoded({ extended: true, limit: '10mb' })); // Parse URL-encoded bodies

// ==========================================
// COOKIE PARSER MIDDLEWARE
// ==========================================
app.use(cookieParser(COOKIE_SECRET));

// ==========================================
// LOGGING MIDDLEWARE
// ==========================================
if (NODE_ENV === 'development') {
  // Detailed logging in development
  app.use(morgan('dev'));
} else {
  // Combined logging in production
  app.use(morgan('combined'));
}

// ─────────────────────────────────────────────
// STATIC FILES (Uploads)
// ─────────────────────────────────────────────
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ==========================================
// API ROUTES
// ==========================================

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: NODE_ENV,
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Healthcare Authentication API',
    version: '1.0.0',
      endpoints: {
        health: '/health',
        auth: '/api/auth',
        users: '/api/users',
        admin: '/api/admin',
        healthData: "/api/health-data",
        reports: "/api/reports",
        docs: 'See API_DOCUMENTATION.md',
        swaggerImasha: 'http://localhost:5000/api-docs/imasha',
      },
  });
});

// Swagger UI for Imasha module APIs (Auth, Users, Admin, Reports)
app.use('/api-docs/imasha', swaggerUi.serve, swaggerUi.setup(imashaOpenApi, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Imasha Module API',
}));

// Authentication routes
app.use('/api/auth', authRoutes);

// User management routes
app.use('/api/users', userRoutes);

// Admin management routes (doctors and caregivers)
app.use('/api/admin', adminRoutes);

// Health System Routes
app.use("/api/health-data", healthDataRoutes);
app.use("/api/health-data", simulatorRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/nutrition", nutritionRoutes);
app.use("/api/meal-plans", mealPlanRoutes);
app.use("/api/meal-reminders", mealReminderRoutes);

// ─────────────────────────────────────────────
// CONTINUOUS SIMULATOR
// ─────────────────────────────────────────────
const startContinuousSimulator = () => {
  console.log("🤖 Continuous simulator started for all users...");

  setInterval(async () => {
    try {
      const users = await User.find({}, "_id");

      if (!users.length) {
        console.log("[Simulator] No users found, skipping...");
        return;
      }

      for (const user of users) {
        const roll = Math.random();
        const scenario =
          roll < 0.15
            ? "emergency"  
            : roll < 0.25
            ? "oxygen_drop"
            : "normal";

        const result = await runSimulator(user._id.toString(), scenario);

        console.log(
          `[Simulator] userId=${user._id} | scenario=${scenario} | alerts=${result.alerts.length}`
        );
      }
    } catch (err) {
      console.error("[Simulator] Error:", err.message);
    }
  }, process.env.SIMULATOR_INTERVAL_MS || 30000);
};

// Start simulator AFTER DB is connected
startContinuousSimulator();

// Report management routes
app.use('/api/reports', userReportRoutes);
// ─────────────────────────────────────────────
// MEAL REMINDER PROCESSOR
// ─────────────────────────────────────────────
const startMealReminderProcessor = () => {
  console.log("🔔 Meal reminder processor started...");

  // Process reminders every minute
  setInterval(async () => {
    try {
      const users = await User.find({}, "_id");
      
      for (const user of users) {
        // Generate reminders for active meal plans
        await reminderService.generateRemindersForActivePlans(user._id.toString());
        
        // Get pending reminders that are due
        const pendingReminders = await reminderService.getPendingReminders(user._id.toString(), 10);
        
        // Send reminders
        for (const reminder of pendingReminders) {
          try {
            await reminderService.sendReminder(reminder._id.toString());
            console.log(`[Reminder] Sent reminder ${reminder._id} to user ${user._id}`);
          } catch (err) {
            console.error(`[Reminder] Failed to send reminder ${reminder._id}:`, err.message);
          }
        }
      }
    } catch (err) {
      console.error("[Reminder Processor] Error:", err.message);
    }
  }, 60000); // Run every minute
};

// Start reminder processor AFTER DB is connected
startMealReminderProcessor();


// Priya Routes
import appointmentsRoutes from "./routes/Priya/appointmentsRoutes.js";
import exerciseRoutes from "./routes/Priya/exerciseRoutes.js";
import emailLogRoutes from "./routes/Priya/emailLogRoute.js";

app.use('/api/email-logs', emailLogRoutes);
app.use('/api/appointments', appointmentsRoutes);
app.use('/api/exercise', exerciseRoutes);



// ==========================================
// ERROR HANDLING MIDDLEWARE
try {
    const bookingEmailController = require('./controllers/bookingEmailController');
    app.post('/api/send-booking-email', bookingEmailController.sendBookingSuccessEmail);
} catch (error) {
    console.warn('bookingEmailController not found. /api/send-booking-email is disabled.');
}
// ==========================================

// 404 handler (must be after all routes)
app.use(notFound);

// MongoDB error handlers
app.use(handleDuplicateKeyError);
app.use(handleValidationError);
app.use(handleCastError);

// Global error handler (must be last)
app.use(errorHandler);

// ==========================================
// START SERVER
// ==========================================
const server = app.listen(PORT, () => {
  console.log('');
  console.log('='.repeat(50));
  console.log('Healthcare Authentication Server Started');
  console.log('='.repeat(50));
  console.log(`Server: http://localhost:${PORT}`);
  console.log(`Environment: ${NODE_ENV}`);
  console.log(`Health Check: http://localhost:${PORT}/health`);
  console.log(`Auth API: http://localhost:${PORT}/api/auth`);
  console.log('='.repeat(50));
  console.log('');
});

// ==========================================
// GRACEFUL SHUTDOWN HANDLING
// ==========================================

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Promise Rejection:', err);
  console.error('Shutting down server...');
  
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  console.error('Shutting down server...');
  
  server.close(() => {
    process.exit(1);
  });
});

// Handle SIGTERM (for deployment platforms like Heroku)
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM received. Shutting down gracefully...');
  
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

// Handle SIGINT (Ctrl+C)
process.on('SIGINT', () => {
  console.log('\n👋 SIGINT received. Shutting down gracefully...');
  
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

export default app;
