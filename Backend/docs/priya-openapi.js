/**
 * OpenAPI 3.0 spec for Priya module only (Appointments, Exercise, Email Logs, Booking Email).
 * Served at /api-docs/priya for Swagger UI testing.
 */
export default {
    openapi: '3.0.3',
    info: {
        title: 'Health Tracker - Priya Module API',
        version: '1.0.0',
        description: 'Appointment management, exercise logs, email logs, and booking email APIs.',
    },
    servers: [
        { url: 'http://localhost:5000', description: 'Local' },
    ],
    components: {
        securitySchemes: {
            bearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
            },
        },
        schemas: {
            AppointmentRequest: {
                type: 'object',
                properties: {
                    patientName: { type: 'string', example: 'John Doe' },
                    patientEmail: { type: 'string', format: 'email', example: 'john@example.com' },
                    doctorName: { type: 'string', example: 'Dr. Silva' },
                    date: { type: 'string', format: 'date', example: '2026-03-15' },
                    time: { type: 'string', example: '10:30 AM' },
                    reason: { type: 'string', example: 'Routine checkup' },
                    status: { type: 'string', example: 'pending' },
                },
                additionalProperties: true,
            },
            ExerciseRequest: {
                type: 'object',
                properties: {
                    userId: { type: 'string', example: '67c123abc456def789012345' },
                    type: { type: 'string', example: 'Walking' },
                    durationMinutes: { type: 'number', example: 30 },
                    caloriesBurned: { type: 'number', example: 220 },
                    date: { type: 'string', format: 'date', example: '2026-03-10' },
                    notes: { type: 'string', example: 'Morning session' },
                },
                additionalProperties: true,
            },
            BookingEmailRequest: {
                type: 'object',
                properties: {
                    to: { type: 'string', format: 'email', example: 'john@example.com' },
                    subject: { type: 'string', example: 'Appointment Confirmed' },
                    patientName: { type: 'string', example: 'John Doe' },
                    doctorName: { type: 'string', example: 'Dr. Silva' },
                    appointmentDate: { type: 'string', format: 'date', example: '2026-03-15' },
                    appointmentTime: { type: 'string', example: '10:30 AM' },
                },
                additionalProperties: true,
            },
            ErrorResponse: {
                type: 'object',
                properties: {
                    success: { type: 'boolean', example: false },
                    message: { type: 'string', example: 'Something went wrong' },
                },
            },
            LoginRequest: {
                type: 'object',
                properties: {
                    email: { type: 'string', format: 'email', example: 'user@example.com' },
                    password: { type: 'string', example: 'your-password' },
                },
                required: ['email', 'password'],
            },
        },
    },
    security: [{ bearerAuth: [] }],
    tags: [
        { name: 'Auth', description: 'Login and current user profile' },
        { name: 'Appointments', description: 'Appointment CRUD and cancel operations' },
        { name: 'Admin Appointments', description: 'Admin appointment management actions' },
        { name: 'Exercise', description: 'Exercise log CRUD and stats' },
        { name: 'Email Logs', description: 'Email log retrieval' },
        { name: 'Booking Email', description: 'Send appointment booking success email' },
    ],
    paths: {
        // -----------------------------------------------------------------
        // AUTH (IMASHA)
        // -----------------------------------------------------------------
        '/api/auth/login': {
            post: {
                tags: ['Auth'],
                summary: 'Login (Imasha)',
                security: [],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/LoginRequest' },
                        },
                    },
                },
                responses: {
                    200: { description: 'Login success' },
                    400: { description: 'Validation error' },
                    401: { description: 'Invalid credentials' },
                    500: { description: 'Server error' },
                },
            },
        },
        '/api/auth/me': {
            get: {
                tags: ['Auth'],
                summary: 'Get current user (Imasha)',
                security: [{ bearerAuth: [] }],
                responses: {
                    200: { description: 'Current user fetched' },
                    401: { description: 'Unauthorized' },
                    500: { description: 'Server error' },
                },
            },
        },
        // -----------------------------------------------------------------
        // EMAIL LOGS
        // -----------------------------------------------------------------
        '/api/email-logs': {
            get: {
                tags: ['Email Logs'],
                summary: 'Get email logs',
                responses: {
                    200: { description: 'Email logs fetched' },
                    500: { description: 'Server error', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
                },
            },
        },

        // -----------------------------------------------------------------
        // APPOINTMENTS
        // -----------------------------------------------------------------
        '/api/appointments': {
            get: {
                tags: ['Appointments'],
                summary: 'Get all appointments',
                responses: {
                    200: { description: 'Appointments fetched' },
                    500: { description: 'Server error' },
                },
            },
            post: {
                tags: ['Appointments'],
                summary: 'Create appointment',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/AppointmentRequest' },
                        },
                    },
                },
                responses: {
                    201: { description: 'Appointment created' },
                    400: { description: 'Validation error' },
                    500: { description: 'Server error' },
                },
            },
        },
        '/api/appointments/{id}': {
            get: {
                tags: ['Appointments'],
                summary: 'Get appointment by ID',
                parameters: [
                    { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
                ],
                responses: {
                    200: { description: 'Appointment fetched' },
                    404: { description: 'Appointment not found' },
                    500: { description: 'Server error' },
                },
            },
            put: {
                tags: ['Appointments'],
                summary: 'Update appointment',
                parameters: [
                    { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
                ],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/AppointmentRequest' },
                        },
                    },
                },
                responses: {
                    200: { description: 'Appointment updated' },
                    404: { description: 'Appointment not found' },
                    500: { description: 'Server error' },
                },
            },
            delete: {
                tags: ['Appointments'],
                summary: 'Delete appointment',
                parameters: [
                    { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
                ],
                responses: {
                    200: { description: 'Appointment deleted' },
                    404: { description: 'Appointment not found' },
                    500: { description: 'Server error' },
                },
            },
        },
        '/api/appointments/{id}/cancel': {
            put: {
                tags: ['Appointments'],
                summary: 'Cancel appointment',
                parameters: [
                    { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
                ],
                responses: {
                    200: { description: 'Appointment cancelled' },
                    404: { description: 'Appointment not found' },
                    500: { description: 'Server error' },
                },
            },
        },
        // -----------------------------------------------------------------
        // ADMIN APPOINTMENTS
        // -----------------------------------------------------------------
        '/api/admin/appointments': {
            get: {
                tags: ['Admin Appointments'],
                summary: 'Get all appointments (admin)',
                responses: {
                    200: { description: 'Appointments fetched' },
                    500: { description: 'Server error' },
                },
            },
        },
        '/api/admin/appointments/{id}/approve': {
            put: {
                tags: ['Admin Appointments'],
                summary: 'Approve appointment (admin)',
                parameters: [
                    { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
                ],
                responses: {
                    200: { description: 'Appointment approved' },
                    404: { description: 'Appointment not found' },
                    500: { description: 'Server error' },
                },
            },
        },
        '/api/admin/appointments/{id}/reject': {
            put: {
                tags: ['Admin Appointments'],
                summary: 'Reject appointment (admin)',
                parameters: [
                    { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
                ],
                responses: {
                    200: { description: 'Appointment rejected' },
                    404: { description: 'Appointment not found' },
                    500: { description: 'Server error' },
                },
            },
        },

        // -----------------------------------------------------------------
        // EXERCISE
        // -----------------------------------------------------------------
        '/api/exercise': {
            get: {
                tags: ['Exercise'],
                summary: 'Get exercise logs',
                responses: {
                    200: { description: 'Exercise logs fetched' },
                    500: { description: 'Server error' },
                },
            },
            post: {
                tags: ['Exercise'],
                summary: 'Create exercise log',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/ExerciseRequest' },
                        },
                    },
                },
                responses: {
                    201: { description: 'Exercise log created' },
                    400: { description: 'Validation error' },
                    500: { description: 'Server error' },
                },
            },
        },
        '/api/exercise/{id}': {
            put: {
                tags: ['Exercise'],
                summary: 'Update exercise log',
                parameters: [
                    { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
                ],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/ExerciseRequest' },
                        },
                    },
                },
                responses: {
                    200: { description: 'Exercise log updated' },
                    404: { description: 'Exercise log not found' },
                    500: { description: 'Server error' },
                },
            },
            delete: {
                tags: ['Exercise'],
                summary: 'Delete exercise log',
                parameters: [
                    { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
                ],
                responses: {
                    200: { description: 'Exercise log deleted' },
                    404: { description: 'Exercise log not found' },
                    500: { description: 'Server error' },
                },
            },
        },
        '/api/exercise/stats': {
            get: {
                tags: ['Exercise'],
                summary: 'Get exercise stats',
                responses: {
                    200: { description: 'Exercise stats fetched' },
                    500: { description: 'Server error' },
                },
            },
        },

        // -----------------------------------------------------------------
        // BOOKING EMAIL
        // -----------------------------------------------------------------
        '/api/send-booking-email': {
            post: {
                tags: ['Booking Email'],
                summary: 'Send booking success email',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/BookingEmailRequest' },
                        },
                    },
                },
                responses: {
                    200: { description: 'Booking email sent' },
                    400: { description: 'Validation error' },
                    500: { description: 'Server error' },
                },
            },
        },
    },
};
