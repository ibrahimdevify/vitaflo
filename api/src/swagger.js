const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Ande API',
      version: '3.0.0',
      description: 'Complete backend API for Ande Health Platform - Clinician Portal & Patient Management',
      contact: {
        name: 'Ande Health',
        email: 'support@vitalflohealth.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Local Development',
      },
      {
        url: 'http://31.97.71.250',
        description: 'Production Server',
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter JWT token or v2 access token',
        },
      },
      schemas: {
        // Auth
        LoginRequest: {
          type: 'object',
          required: ['username', 'password'],
          properties: {
            username: { type: 'string', example: 'clinician1@test.com' },
            password: { type: 'string', example: 'testpass123' },
          },
        },
        RegisterRequest: {
          type: 'object',
          required: ['f_name', 'l_name', 'email', 'phone', 'password', 'ut_id_fk'],
          properties: {
            f_name: { type: 'string', example: 'John' },
            l_name: { type: 'string', example: 'Doe' },
            email: { type: 'string', example: 'john@test.com' },
            phone: { type: 'string', example: '1234567890' },
            password: { type: 'string', example: 'pass123' },
            ut_id_fk: { type: 'integer', example: 4, description: '1=technician, 2=account_admin, 3=clinician, 4=patient' },
            dob: { type: 'string', example: '1990-01-15' },
            gender_id_fk: { type: 'integer', example: 1 },
          },
        },
        AuthResponse: {
          type: 'object',
          properties: {
            message: { type: 'string' },
            access_token: { type: 'string' },
            jwt_token: { type: 'string' },
            refresh_token: { type: 'string' },
            user: { type: 'object' },
          },
        },
        // User
        UserResponse: {
          type: 'object',
          properties: {
            user_id: { type: 'integer' },
            f_name: { type: 'string' },
            l_name: { type: 'string' },
            email: { type: 'string' },
            phone: { type: 'string' },
            user_type: { type: 'object' },
            user_status: { type: 'object' },
          },
        },
        // Patient
        PatientCreate: {
          type: 'object',
          properties: {
            f_name: { type: 'string' },
            l_name: { type: 'string' },
            email: { type: 'string' },
            phone: { type: 'string' },
            password: { type: 'string' },
            ut_id_fk: { type: 'integer', example: 4 },
            chart_no: { type: 'string' },
            blood_group: { type: 'string' },
            dob: { type: 'string' },
          },
        },
        // Device
        DeviceCreate: {
          type: 'object',
          required: ['dev_name'],
          properties: {
            dev_name: { type: 'string', example: 'Air Sensor A1' },
            dev_detail: { type: 'string', example: 'Indoor monitor' },
            dev_image: { type: 'string' },
          },
        },
        // Notification
        NotificationSend: {
          type: 'object',
          required: ['user_id', 'title', 'body'],
          properties: {
            user_id: { type: 'integer' },
            title: { type: 'string' },
            body: { type: 'string' },
            data: { type: 'object' },
          },
        },
        // Error
        ErrorResponse: {
          type: 'object',
          properties: {
            error: { type: 'string' },
          },
        },
      },
    },
    tags: [
      { name: 'Auth', description: 'Authentication & Authorization' },
      { name: 'Users', description: 'User management' },
      { name: 'Patients', description: 'Patient management & medical records' },
      { name: 'Clinicians', description: 'Clinician/Doctor management' },
      { name: 'Dashboard', description: 'Stats & Analytics' },
      { name: 'Devices', description: 'IoT Devices & Air Monitors' },
      { name: 'Notifications', description: 'FCM Push Notifications' },
      { name: 'Accounts', description: 'Multi-tenant organization accounts' },
    ],
  },
  apis: ['./src/routes/*.js'], // Path to route files with JSDoc comments
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
