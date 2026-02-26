/**
 * OpenAPI 3.0 spec for Imasha modules only (Auth, Users, Admin, Reports).
 * Served at /api-docs/imasha for Swagger UI testing.
 */
export default {
  openapi: '3.0.3',
  info: {
    title: 'Health Tracker — Imasha Module API',
    version: '1.0.0',
    description: 'Authentication, User Management, Admin (Doctors & Caregivers), and Reports. Use **Authorize** to set Bearer token after login.',
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
      RegisterRequest: {
        type: 'object',
        required: ['firstName', 'lastName', 'email', 'password'],
        properties: {
          firstName: { type: 'string', example: 'Dulshini' },
          lastName: { type: 'string', example: 'Rukmali' },
          email: { type: 'string', format: 'email', example: 'imogirlcoc@gmail.com' },
          password: { type: 'string', format: 'password', example: 'Imo123!' },
          phone: { type: 'string', example: '+94774275154' },
          dateOfBirth: { type: 'string', format: 'date', example: '2002-10-20' },
          gender: { type: 'string', enum: ['male', 'female', 'other'] },
        },
      },
      ForgotPasswordRequest: {
        type: 'object',
        required: ['email'],
        properties: { email: { type: 'string', format: 'email' } },
      },
      ResetPasswordRequest: {
        type: 'object',
        required: ['token', 'password'],
        properties: {
          token: { type: 'string', description: 'Token from email' },
          password: { type: 'string', format: 'password' },
        },
      },
      RefreshTokenRequest: {
        type: 'object',
        properties: { refreshToken: { type: 'string' } },
      },
      LinkDoctorPatientRequest: {
        type: 'object',
        required: ['doctorId', 'patientId'],
        properties: {
          doctorId: { type: 'string', description: 'User _id of the doctor' },
          patientId: { type: 'string', description: 'User _id of the patient' },
        },
      },
      LinkCaregiverPatientRequest: {
        type: 'object',
        required: ['caregiverId', 'patientId'],
        properties: {
          caregiverId: { type: 'string' },
          patientId: { type: 'string' },
        },
      },
      CreateDoctorRequest: {
        type: 'object',
        required: ['firstName', 'lastName', 'email', 'password'],
        properties: {
          firstName: { type: 'string', example: 'John' },
          lastName: { type: 'string', example: 'Smith' },
          email: { type: 'string', format: 'email', example: 'doctor@hospital.com' },
          password: { type: 'string', format: 'password', example: 'SecurePass123!' },
          phone: { type: 'string' },
          dateOfBirth: { type: 'string', format: 'date' },
          gender: { type: 'string', enum: ['male', 'female', 'other'] },
          address: { type: 'string' },
          specialization: { type: 'string', example: 'Cardiology' },
          licenseNumber: { type: 'string', example: 'MD-001' },
          hospitalOrClinic: { type: 'string' },
          qualifications: { type: 'string' },
        },
      },
      UpdateDoctorRequest: {
        type: 'object',
        properties: {
          firstName: { type: 'string' },
          lastName: { type: 'string' },
          email: { type: 'string', format: 'email' },
          password: { type: 'string', format: 'password' },
          phone: { type: 'string' },
          dateOfBirth: { type: 'string', format: 'date' },
          gender: { type: 'string', enum: ['male', 'female', 'other'] },
          address: { type: 'string' },
          isActive: { type: 'boolean' },
          isEmailVerified: { type: 'boolean' },
          specialization: { type: 'string' },
          licenseNumber: { type: 'string' },
          hospitalOrClinic: { type: 'string' },
          qualifications: { type: 'string' },
        },
      },
      DoctorResponse: {
        type: 'object',
        description: 'Doctor response: _id is the Doctor document ID (use for GET/PUT/DELETE /api/admin/doctors/:id). userId is the User ID (use for linking e.g. doctor-patient).',
        properties: {
          _id: { type: 'string', description: 'Doctor document ID — use this in path for GET/PUT/DELETE /api/admin/doctors/:id', example: '507f1f77bcf86cd799439011' },
          userId: { type: 'string', description: 'User document ID — use for POST /api/users/link/doctor-patient as doctorId', example: '507f1f77bcf86cd799439012' },
          firstName: { type: 'string' },
          lastName: { type: 'string' },
          email: { type: 'string', format: 'email' },
          phone: { type: 'string' },
          dateOfBirth: { type: 'string', format: 'date' },
          gender: { type: 'string', enum: ['male', 'female', 'other'] },
          address: { type: 'string' },
          isActive: { type: 'boolean' },
          isEmailVerified: { type: 'boolean' },
          profileImage: { type: 'string' },
          specialization: { type: 'string' },
          licenseNumber: { type: 'string' },
          hospitalOrClinic: { type: 'string' },
          qualifications: { type: 'string' },
          linkedPatients: { type: 'array', items: { type: 'object' } },
        },
      },
      CreateCaregiverRequest: {
        type: 'object',
        required: ['firstName', 'lastName', 'email', 'password'],
        properties: {
          firstName: { type: 'string', example: 'Jane' },
          lastName: { type: 'string', example: 'Doe' },
          email: { type: 'string', format: 'email', example: 'caregiver@example.com' },
          password: { type: 'string', format: 'password', example: 'SecurePass123!' },
          phone: { type: 'string' },
          dateOfBirth: { type: 'string', format: 'date' },
          gender: { type: 'string', enum: ['male', 'female', 'other'] },
          address: { type: 'string' },
        },
      },
      UpdateCaregiverRequest: {
        type: 'object',
        properties: {
          firstName: { type: 'string' },
          lastName: { type: 'string' },
          email: { type: 'string', format: 'email' },
          password: { type: 'string', format: 'password' },
          phone: { type: 'string' },
          dateOfBirth: { type: 'string', format: 'date' },
          gender: { type: 'string', enum: ['male', 'female', 'other'] },
          address: { type: 'string' },
          isActive: { type: 'boolean' },
          isEmailVerified: { type: 'boolean' },
        },
      },
      UpdateUserRequest: {
        type: 'object',
        properties: {
          firstName: { type: 'string' },
          lastName: { type: 'string' },
          phone: { type: 'string' },
          dateOfBirth: { type: 'string', format: 'date' },
          gender: { type: 'string', enum: ['male', 'female', 'other'] },
          address: { type: 'string' },
          role: { type: 'string', enum: ['admin', 'doctor', 'patient', 'caregiver'] },
          isActive: { type: 'boolean' },
          isEmailVerified: { type: 'boolean' },
        },
      },
      GenerateReportRequest: {
        type: 'object',
        required: ['type', 'dateFrom', 'dateTo'],
        properties: {
          type: { type: 'string', enum: ['user_activity', 'system'], example: 'user_activity' },
          title: { type: 'string', example: 'Monthly activity report' },
          dateFrom: { type: 'string', format: 'date', example: '2025-01-01' },
          dateTo: { type: 'string', format: 'date', example: '2025-01-31' },
        },
      },
    },
  },
  security: [],
  tags: [
    { name: 'Auth', description: 'Authentication (Imasha)' },
    { name: 'Users', description: 'User management (Imasha)' },
    { name: 'Admin - Doctors', description: 'Doctor CRUD (Imasha)' },
    { name: 'Admin - Caregivers', description: 'Caregiver CRUD (Imasha)' },
    { name: 'Reports', description: 'Reports (Imasha)' },
  ],
  paths: {
    // ─────────────────────────────────────────────────────────────────
    // AUTH
    // ─────────────────────────────────────────────────────────────────
    '/api/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Register patient',
        description: 'Public. Register a new patient; sends email verification.',
        requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/RegisterRequest' } } } },
        responses: { 201: { description: 'Registered' }, 400: { description: 'Validation error' }, 409: { description: 'Email exists' } },
      },
    },
    '/api/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Login',
        description: 'Public. Returns access token and role-based redirect URL. Use the access token in Authorize for protected endpoints.',
        requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/LoginRequest' } } } },
        responses: { 200: { description: 'Login success, returns accessToken' }, 401: { description: 'Invalid credentials' } },
      },
    },
    '/api/auth/logout': {
      post: {
        tags: ['Auth'],
        summary: 'Logout',
        security: [{ BearerAuth: [] }],
        requestBody: { content: { 'application/json': { schema: { type: 'object' } } } },
        responses: { 200: { description: 'Logged out' }, 401: { description: 'Unauthorized' } },
      },
    },
    '/api/auth/refresh': {
      post: {
        tags: ['Auth'],
        summary: 'Refresh access token',
        requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/RefreshTokenRequest' } } } },
        responses: { 200: { description: 'New access token' }, 401: { description: 'Invalid refresh token' } },
      },
    },
    '/api/auth/verify-email/{token}': {
      get: {
        tags: ['Auth'],
        summary: 'Verify email',
        parameters: [{ name: 'token', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Email verified' }, 400: { description: 'Invalid token' } },
      },
    },
    '/api/auth/forgot-password': {
      post: {
        tags: ['Auth'],
        summary: 'Forgot password',
        requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/ForgotPasswordRequest' } } } },
        responses: { 200: { description: 'Reset email sent' }, 404: { description: 'User not found' } },
      },
    },
    '/api/auth/reset-password': {
      post: {
        tags: ['Auth'],
        summary: 'Reset password',
        requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/ResetPasswordRequest' } } } },
        responses: { 200: { description: 'Password reset' }, 400: { description: 'Invalid token' } },
      },
    },
    '/api/auth/google': {
      get: {
        tags: ['Auth'],
        summary: 'Google OAuth (redirect)',
        responses: { 302: { description: 'Redirect to Google' } },
      },
    },
    '/api/auth/google/callback': {
      get: {
        tags: ['Auth'],
        summary: 'Google OAuth callback',
        responses: { 302: { description: 'Redirect after login' } },
      },
    },
    '/api/auth/me': {
      get: {
        tags: ['Auth'],
        summary: 'Get current user',
        security: [{ BearerAuth: [] }],
        responses: { 200: { description: 'Current user profile' }, 401: { description: 'Unauthorized' } },
      },
    },
    // ─────────────────────────────────────────────────────────────────
    // USERS
    // ─────────────────────────────────────────────────────────────────
    '/api/users': {
      get: {
        tags: ['Users'],
        summary: 'Get all users',
        description: 'Admin only. Pagination, search, filters.',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
          { name: 'role', in: 'query', schema: { type: 'string', enum: ['admin', 'doctor', 'patient', 'caregiver'] } },
          { name: 'search', in: 'query', schema: { type: 'string' } },
          { name: 'isActive', in: 'query', schema: { type: 'boolean' } },
        ],
        responses: { 200: { description: 'List of users' }, 401: { description: 'Unauthorized' }, 403: { description: 'Admin only' } },
      },
    },
    '/api/users/link/doctor-patient': {
      post: {
        tags: ['Users'],
        summary: 'Link doctor to patient',
        description: 'Admin only. doctorId and patientId are User _ids.',
        security: [{ BearerAuth: [] }],
        requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/LinkDoctorPatientRequest' } } } },
        responses: { 200: { description: 'Linked' }, 400: { description: 'Bad request' }, 403: { description: 'Admin only' } },
      },
    },
    '/api/users/link/caregiver-patient': {
      post: {
        tags: ['Users'],
        summary: 'Assign caregiver to patient',
        security: [{ BearerAuth: [] }],
        requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/LinkCaregiverPatientRequest' } } } },
        responses: { 200: { description: 'Assigned' }, 403: { description: 'Admin only' } },
      },
    },
    '/api/users/{id}': {
      get: {
        tags: ['Users'],
        summary: 'Get user by ID',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'User' }, 401: { description: 'Unauthorized' }, 404: { description: 'Not found' } },
      },
      put: {
        tags: ['Users'],
        summary: 'Update user profile',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/UpdateUserRequest' } } } },
        responses: { 200: { description: 'Updated' }, 401: { description: 'Unauthorized' }, 404: { description: 'Not found' } },
      },
      delete: {
        tags: ['Users'],
        summary: 'Delete user (soft)',
        description: 'Admin only.',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Deleted' }, 401: { description: 'Unauthorized' }, 403: { description: 'Admin only' } },
      },
    },
    '/api/users/{id}/profile-image': {
      put: {
        tags: ['Users'],
        summary: 'Upload profile image',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                required: ['profileImage'],
                properties: { profileImage: { type: 'string', format: 'binary' } },
              },
            },
          },
        },
        responses: { 200: { description: 'Image updated' }, 401: { description: 'Unauthorized' } },
      },
    },
    // ─────────────────────────────────────────────────────────────────
    // ADMIN - DOCTORS
    // ─────────────────────────────────────────────────────────────────
    '/api/admin/doctors': {
      get: {
        tags: ['Admin - Doctors'],
        summary: 'Get all doctors',
        description: 'Admin only. :id in other doctor routes is Doctor document _id.',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
          { name: 'search', in: 'query', schema: { type: 'string' } },
          { name: 'isActive', in: 'query', schema: { type: 'boolean' } },
        ],
        responses: {
          200: {
            description: 'List of doctors. Each item has _id (Doctor document ID) and userId (User ID) — they are different.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: { type: 'array', items: { $ref: '#/components/schemas/DoctorResponse' } },
                    pagination: { type: 'object' },
                  },
                },
              },
            },
          },
          401: { description: 'Unauthorized' },
          403: { description: 'Admin only' },
        },
      },
      post: {
        tags: ['Admin - Doctors'],
        summary: 'Create doctor',
        description: 'Admin only. Creates User (role doctor) + Doctor document. Password is hashed. Response _id = Doctor doc ID, userId = User ID (use for linking).',
        security: [{ BearerAuth: [] }],
        requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateDoctorRequest' } } } },
        responses: {
          201: {
            description: 'Doctor created. Use response._id for GET/PUT/DELETE doctor; use response.userId as doctorId when linking to patient.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: { $ref: '#/components/schemas/DoctorResponse' },
                  },
                },
              },
            },
          },
          400: { description: 'Validation error' },
          403: { description: 'Admin only' },
        },
      },
    },
    '/api/admin/doctors/{id}': {
      get: {
        tags: ['Admin - Doctors'],
        summary: 'Get doctor by ID',
        description: 'Path :id must be the Doctor document _id (response._id), not userId.',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'Doctor document _id' }],
        responses: {
          200: {
            description: 'Doctor. _id = Doctor doc ID, userId = User ID.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: { $ref: '#/components/schemas/DoctorResponse' },
                  },
                },
              },
            },
          },
          401: { description: 'Unauthorized' },
          404: { description: 'Not found' },
        },
      },
      put: {
        tags: ['Admin - Doctors'],
        summary: 'Update doctor',
        description: 'Path :id must be the Doctor document _id. Updates both User and Doctor. Password is hashed if sent.',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'Doctor document _id' }],
        requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/UpdateDoctorRequest' } } } },
        responses: {
          200: {
            description: 'Updated. _id and userId remain distinct.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: { $ref: '#/components/schemas/DoctorResponse' },
                  },
                },
              },
            },
          },
          401: { description: 'Unauthorized' },
          404: { description: 'Not found' },
        },
      },
      delete: {
        tags: ['Admin - Doctors'],
        summary: 'Delete doctor (soft)',
        description: 'Path :id must be the Doctor document _id.',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'Doctor document _id' }],
        responses: { 200: { description: 'Deleted' }, 401: { description: 'Unauthorized' }, 403: { description: 'Admin only' } },
      },
    },
    // ─────────────────────────────────────────────────────────────────
    // ADMIN - CAREGIVERS
    // ─────────────────────────────────────────────────────────────────
    '/api/admin/caregivers': {
      get: {
        tags: ['Admin - Caregivers'],
        summary: 'Get all caregivers',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
          { name: 'search', in: 'query', schema: { type: 'string' } },
          { name: 'isActive', in: 'query', schema: { type: 'boolean' } },
        ],
        responses: { 200: { description: 'List of caregivers' }, 401: { description: 'Unauthorized' }, 403: { description: 'Admin only' } },
      },
      post: {
        tags: ['Admin - Caregivers'],
        summary: 'Create caregiver',
        security: [{ BearerAuth: [] }],
        requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateCaregiverRequest' } } } },
        responses: { 201: { description: 'Caregiver created' }, 400: { description: 'Validation error' }, 403: { description: 'Admin only' } },
      },
    },
    '/api/admin/caregivers/{id}': {
      get: {
        tags: ['Admin - Caregivers'],
        summary: 'Get caregiver by ID',
        description: 'id = User _id',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Caregiver' }, 401: { description: 'Unauthorized' }, 404: { description: 'Not found' } },
      },
      put: {
        tags: ['Admin - Caregivers'],
        summary: 'Update caregiver',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/UpdateCaregiverRequest' } } } },
        responses: { 200: { description: 'Updated' }, 401: { description: 'Unauthorized' }, 404: { description: 'Not found' } },
      },
      delete: {
        tags: ['Admin - Caregivers'],
        summary: 'Delete caregiver (soft)',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Deleted' }, 401: { description: 'Unauthorized' }, 403: { description: 'Admin only' } },
      },
    },
    // ─────────────────────────────────────────────────────────────────
    // REPORTS (Imasha)
    // ─────────────────────────────────────────────────────────────────
    '/api/reports/generate': {
      post: {
        tags: ['Reports'],
        summary: 'Generate report',
        description: 'Admin only. Types: user_activity, system.',
        security: [{ BearerAuth: [] }],
        requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/GenerateReportRequest' } } } },
        responses: { 201: { description: 'Report generated' }, 400: { description: 'Bad request' }, 403: { description: 'Admin only' } },
      },
    },
    '/api/reports': {
      get: {
        tags: ['Reports'],
        summary: 'Get all reports',
        description: 'Admin: all reports. Patient: own only.',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer' } },
          { name: 'limit', in: 'query', schema: { type: 'integer' } },
          { name: 'type', in: 'query', schema: { type: 'string', enum: ['user_activity', 'system'] } },
          { name: 'status', in: 'query', schema: { type: 'string' } },
        ],
        responses: { 200: { description: 'List of reports' }, 401: { description: 'Unauthorized' } },
      },
    },
    '/api/reports/{id}': {
      get: {
        tags: ['Reports'],
        summary: 'Get report by ID',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Report' }, 401: { description: 'Unauthorized' }, 404: { description: 'Not found' } },
      },
      delete: {
        tags: ['Reports'],
        summary: 'Delete report',
        description: 'Patients can only delete their own.',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Deleted' }, 401: { description: 'Unauthorized' }, 404: { description: 'Not found' } },
      },
    },
  },
};