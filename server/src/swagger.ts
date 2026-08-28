import swaggerJSDoc from "swagger-jsdoc";

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Local Logistics System API",
      version: "1.0.0",
      description: "API documentation for Dispatch Command and Driver Portal",
    },
    servers: [
      {
        url: "http://localhost:3000/api",
        description: "Local Server",
      },
    ],
  },
  apis: ["./src/routes/*.ts", "./src/routes/*.js"], // Path to the files containing @swagger annotations
};

export const swaggerSpec = swaggerJSDoc(options);
