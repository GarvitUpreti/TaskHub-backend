const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "TaskHub API",
      version: "1.0.0",
      description:
        "TaskHub backend API documentation. Includes JWT authentication, RBAC, ownership checks, rate limiting, and audit logs.",
    },
    servers: [
      {
        url: "http://localhost:5000/api/v1",
        description: "Local development server",
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    // ❌ NO global security here
  },
  apis: [
    "./src/auth/*.routes.js",
    "./src/tasks/*.routes.js",
  ],
};

const specs = swaggerJsdoc(options);
module.exports = specs;
