import Express from "express";
import { envelopeRouter } from "./routers/envelope-router";
import { initializeDb, dbConfig } from "./db/db";

import dotenv from "dotenv";
dotenv.config(); // load .env file

const app = Express();
const PORT = "3000";

try {
  initializeDb(dbConfig);
  app.use(Express.json());

  app.use("/envelopes", envelopeRouter);

  app.use((req, res) => {
    res.status(404).send(`Endpoint '${req.url}' not Found`);
  });

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
} catch (error) {
  console.error("Error starting the server:", error);
}
