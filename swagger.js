const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "E-Learning Platform API",
      version: "1.0.0",
      description: "API documentation for the e-learning platform",
    },
    servers: [
      { url: "https://e-learning.cheat.casa" },
    ],
  },
  apis: ["./routes/*.js"],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
