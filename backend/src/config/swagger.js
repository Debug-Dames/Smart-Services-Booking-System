import swaggerJsdoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Smart Salon Booking API",
      version: "1.0.0",
      description: "API documentation for Smart Salon Booking System",
    },
    servers: [
      {
        url: "http://localhost:5000",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },

      schemas: {

        /* ================= USERS ================= */
        User: {
          type: "object",
          properties: {
            id: { type: "integer", example: 1 },
            name: { type: "string", example: "Jane Doe" },
            email: { type: "string", example: "jane@email.com" },
            role: { type: "string", example: "user" }
          }
        },

        /* ================= AUTH ================= */
        RegisterInput: {
          type: "object",
          required: ["name", "email", "password"],
          properties: {
            name: { type: "string", example: "Jane Doe" },
            email: { type: "string", example: "jane@email.com" },
            password: { type: "string", example: "Password123" }
          }
        },

        LoginInput: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: { type: "string", example: "jane@email.com" },
            password: { type: "string", example: "Password123" }
          }
        },

        AuthResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            token: { type: "string", example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." },
            user: {
              $ref: "#/components/schemas/User"
            }
          }
        },

        /* ================= BOOKINGS ================= */
        Booking: {
          type: "object",
          properties: {
            id: { type: "integer", example: 10 },
            userId: { type: "integer", example: 1 },
            serviceId: { type: "integer", example: 2 },
            date: { type: "string", format: "date", example: "2026-03-10" },
            time: { type: "string", example: "14:00" },
            status: { type: "string", example: "confirmed" }
          }
        },

        CreateBookingInput: {
          type: "object",
          required: ["serviceId", "date", "time"],
          properties: {
            serviceId: { type: "integer", example: 2 },
            date: { type: "string", format: "date", example: "2026-03-10" },
            time: { type: "string", example: "14:00" }
          }
        },

        AdminUpdateBookingInput: {
          type: "object",
          properties: {
            status: {
              type: "string",
              enum: ["pending", "confirmed", "cancelled"],
              example: "confirmed"
            }
          }
        },

        /* ================= ERRORS ================= */
        ErrorResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            message: { type: "string", example: "Unauthorized access" }
          }
        }

      }
      
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: 
    ["./src/modules/auth/*.js",
    "./src/modules/bookings/*.js"]
    };

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;