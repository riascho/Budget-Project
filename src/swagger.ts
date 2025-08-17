import swaggerJSDoc from "swagger-jsdoc"; // scans files specified in options.apis
import swaggerUi from "swagger-ui-express";
import { Express } from "express";

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Personal Budget API",
      version: "1.0.0",
      description:
        "A budget manager API for tracking envelopes and transactions",
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Development server",
      },
    ],
    components: {
      schemas: {
        Envelopes: {
          type: "object",
          properties: {
            id: {
              type: "serial",
              description: "Unique identifier for the envelope",
              example: 1,
            },
            title: {
              type: "string",
              description: "Name for the envelope",
              example: "BEAUTY",
            },
            budget: {
              type: "number",
              format: "float",
              description: "Budget amount for the envelope",
              example: 500.0,
            },
            balance: {
              type: "number",
              format: "float",
              description: "Current balance of the envelope",
              example: 500.0,
            },
          },
          required: ["title", "budget"],
        },
        Transactions: {
          type: "object",
          properties: {
            id: {
              type: "serial",
              description: "Unique identifier for the transaction",
              example: 1,
            },
            envelope_id: {
              type: "integer",
              description: "ID of the envelope this transaction belongs to",
              example: 1,
            },
            amount: {
              type: "number",
              format: "float",
              description: "Transaction amount",
              example: 25.5,
            },
            date: {
              type: "date",
              description: "Transaction date",
              example: "2023-03-15",
            },
            description: {
              type: "string",
              description: "Transaction description",
              example: "Grocery Store",
            },
          },
          required: ["description", "amount", "date"],
        },
      },
    },
  },
  apis: ["./src/docs/*.ts"],
};

const swaggerSpec = swaggerJSDoc(options);

export const setupSwagger = (app: Express): void => {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  console.log("Swagger UI available at http://localhost:3000/api-docs");
};
