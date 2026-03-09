/**
 * OpenAPI 3.0 spec for Tharindu's modules (Alerts, Notifications, Caregiver Bookings).
 */
export default {
    openapi: '3.0.3',
    info: {
        title: 'Health Tracker — Tharindu Module API',
        version: '1.0.0',
        description: 'Endpoints for Alerts, Notifications, and Caregiver Bookings. Use **Authorize** with your JWT token.',
    },
    servers: [
        { url: 'http://localhost:5000', description: 'Local' },
    ],
    components: {
        securitySchemes: {
            BearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
                description: 'Access token from POST /api/auth/login',
            },
        },
        schemas: {
            LoginRequest: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                    email: { type: 'string', format: 'email', example: 'admin@healthcare.com' },
                    password: { type: 'string', format: 'password', example: 'Admin123!' },
                },
            },
            RequestBooking: {
                type: 'object',
                required: ['caregiverId', 'date', 'startTime', 'endTime'],
                properties: {
                    caregiverId: { type: 'string', example: '69941f3ed55064c9992a67cb' },
                    date: { type: 'string', format: 'date', example: '2026-03-01' },
                    startTime: { type: 'string', example: '09:00 AM' },
                    endTime: { type: 'string', example: '05:00 PM' },
                    notes: { type: 'string', example: 'Morning assistance needed.' },
                },
            },
            UpdateBookingStatus: {
                type: 'object',
                required: ['status'],
                properties: {
                    status: { type: 'string', enum: ['Approved', 'Rejected', 'Completed', 'Cancelled'], example: 'Approved' },
                },
            },
            UpsertThresholds: {
                type: 'object',
                properties: {
                    heartRateMax: { type: 'number', example: 120 },
                    oxygenMin: { type: 'number', example: 92 },
                    glucoseMax: { type: 'number', example: 180 },
                },
            },
            ResolveAlertRequest: {
                type: 'object',
                required: ['resolutionNotes'],
                properties: {
                    resolutionNotes: { type: 'string', example: 'Took medication, resting now.' },
                },
            },
        },
    },
    tags: [
        { name: 'Tharindu - Auth', description: 'Login and current user (get token for other endpoints)' },
        { name: 'Tharindu - Alerts', description: 'Real-time health alert management' },
        { name: 'Tharindu - Notifications', description: 'In-app and toast notifications' },
        { name: 'Tharindu - Caregiver Bookings', description: 'Patient-caregiver appointments' },
    ],
    paths: {
        // ─────────────────────────────────────────────────────────────────
        // AUTH (login + me — use token in Authorize for other endpoints)
        // ─────────────────────────────────────────────────────────────────
        '/api/auth/login': {
            post: {
                tags: ['Tharindu - Auth'],
                summary: 'Login',
                description: 'Returns accessToken. Use it in **Authorize** above to call Alerts, Notifications, Bookings.',
                security: [],
                requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/LoginRequest' } } } },
                responses: {
                    200: { description: 'Login success, returns accessToken and user' },
                    401: { description: 'Invalid credentials' },
                },
            },
        },
        '/api/auth/me': {
            get: {
                tags: ['Tharindu - Auth'],
                summary: 'Get current user',
                description: 'Returns the logged-in user profile. Requires Bearer token from login.',
                security: [{ BearerAuth: [] }],
                responses: {
                    200: { description: 'Current user profile' },
                    401: { description: 'Unauthorized' },
                },
            },
        },
        // ─────────────────────────────────────────────────────────────────
        // ALERTS
        // ─────────────────────────────────────────────────────────────────
        '/api/alerts': {
            get: {
                tags: ['Tharindu - Alerts'],
                summary: 'Get all alerts',
                security: [{ BearerAuth: [] }],
                responses: { 200: { description: 'List of alerts' } },
            },
            post: {
                tags: ['Tharindu - Alerts'],
                summary: 'Manually generate alert',
                security: [{ BearerAuth: [] }],
                requestBody: { content: { 'application/json': { schema: { type: 'object', properties: { parameter: { type: 'string' }, value: { type: 'number' } } } } } },
                responses: { 201: { description: 'Alert generated' } },
            },
        },
        '/api/alerts/{id}/resolve': {
            patch: {
                tags: ['Tharindu - Alerts'],
                summary: 'Resolve an alert',
                security: [{ BearerAuth: [] }],
                parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
                requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/ResolveAlertRequest' } } } },
                responses: { 200: { description: 'Alert resolved' } },
            },
        },
        '/api/alerts/{id}': {
            delete: {
                tags: ['Tharindu - Alerts'],
                summary: 'Delete alert',
                security: [{ BearerAuth: [] }],
                parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
                responses: { 200: { description: 'Alert deleted' } },
            },
        },
        // ─────────────────────────────────────────────────────────────────
        // ALERT SETTINGS
        // ─────────────────────────────────────────────────────────────────
        '/api/alert-settings/{userId}': {
            get: {
                tags: ['Tharindu - Alerts'],
                summary: 'Get user thresholds',
                security: [{ BearerAuth: [] }],
                parameters: [{ name: 'userId', in: 'path', required: true, schema: { type: 'string' } }],
                responses: { 200: { description: 'Threshold settings' } },
            },
            put: {
                tags: ['Tharindu - Alerts'],
                summary: 'Update user thresholds',
                security: [{ BearerAuth: [] }],
                parameters: [{ name: 'userId', in: 'path', required: true, schema: { type: 'string' } }],
                requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/UpsertThresholds' } } } },
                responses: { 200: { description: 'Updated' } },
            },
        },
        // ─────────────────────────────────────────────────────────────────
        // NOTIFICATIONS
        // ─────────────────────────────────────────────────────────────────
        '/api/notifications/{userId}': {
            get: {
                tags: ['Tharindu - Notifications'],
                summary: 'Get user notifications',
                security: [{ BearerAuth: [] }],
                parameters: [{ name: 'userId', in: 'path', required: true, schema: { type: 'string' } }],
                responses: { 200: { description: 'List of notifications' } },
            },
        },
        '/api/notifications/{id}/read': {
            patch: {
                tags: ['Tharindu - Notifications'],
                summary: 'Mark notification as read',
                security: [{ BearerAuth: [] }],
                parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
                responses: { 200: { description: 'Marked as read' } },
            },
        },
        '/api/notifications/user/{userId}/read-all': {
            patch: {
                tags: ['Tharindu - Notifications'],
                summary: 'Mark all as read',
                security: [{ BearerAuth: [] }],
                parameters: [{ name: 'userId', in: 'path', required: true, schema: { type: 'string' } }],
                responses: { 200: { description: 'All marked as read' } },
            },
        },
        '/api/notifications/{id}': {
            delete: {
                tags: ['Tharindu - Notifications'],
                summary: 'Delete single notification',
                security: [{ BearerAuth: [] }],
                parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
                responses: { 200: { description: 'Deleted' } },
            },
        },
        '/api/notifications/user/{userId}': {
            delete: {
                tags: ['Tharindu - Notifications'],
                summary: 'Clear all notifications',
                security: [{ BearerAuth: [] }],
                parameters: [{ name: 'userId', in: 'path', required: true, schema: { type: 'string' } }],
                responses: { 200: { description: 'Cleared' } },
            },
        },
        // ─────────────────────────────────────────────────────────────────
        // CAREGIVER BOOKINGS
        // ─────────────────────────────────────────────────────────────────
        '/api/tharindu/bookings/request': {
            post: {
                tags: ['Tharindu - Caregiver Bookings'],
                summary: 'Request booking',
                security: [{ BearerAuth: [] }],
                requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/RequestBooking' } } } },
                responses: { 201: { description: 'Created' } },
            },
        },
        '/api/tharindu/bookings/my-bookings': {
            get: {
                tags: ['Tharindu - Caregiver Bookings'],
                summary: 'Get my bookings',
                security: [{ BearerAuth: [] }],
                responses: { 200: { description: 'List of bookings' } },
            },
        },
        '/api/tharindu/bookings/status/{bookingId}': {
            patch: {
                tags: ['Tharindu - Caregiver Bookings'],
                summary: 'Update booking status',
                security: [{ BearerAuth: [] }],
                parameters: [{ name: 'bookingId', in: 'path', required: true, schema: { type: 'string' } }],
                requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/UpdateBookingStatus' } } } },
                responses: { 200: { description: 'Status updated' } },
            },
        },
        '/api/tharindu/bookings/{bookingId}': {
            delete: {
                tags: ['Tharindu - Caregiver Bookings'],
                summary: 'Delete/Cancel booking',
                security: [{ BearerAuth: [] }],
                parameters: [{ name: 'bookingId', in: 'path', required: true, schema: { type: 'string' } }],
                responses: { 200: { description: 'Deleted' } },
            },
        },
    },
};
