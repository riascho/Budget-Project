import { Pool, PoolClient, PoolConfig } from "pg";
import dotenv from "dotenv";
dotenv.config(); // load .env file

export const dbConfig: PoolConfig = {
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: parseInt(process.env.PGPORT ?? "5432"),
};

export const pool: Pool = new Pool(dbConfig);

export async function initializeDb(config?: PoolConfig) {
  if (!config) {
    if (
      !process.env.PGUSER ||
      !process.env.PGHOST ||
      !process.env.PGDATABASE ||
      !process.env.PGPASSWORD ||
      !process.env.PGPORT
    ) {
      throw new Error(
        "Missing required environment variables for database connection"
      );
    }
  }

  setDbLogger(pool);

  const client: PoolClient = await pool.connect();
  try {
    await client.query(`CREATE TABLE IF NOT EXISTS ENVELOPES (
    id SERIAL PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    budget NUMERIC(10,2) NOT NULL
);
CREATE TABLE IF NOT EXISTS TRANSACTIONS (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL,
    amount NUMERIC(10,2) NOT NULL,
    description TEXT,
    envelope_id INTEGER NOT NULL REFERENCES ENVELOPES(id),
    CONSTRAINT description_cannot_be_empty CHECK (length(trim(description)) > 0)
    );`);
    // await setDbConstraints();
  } catch (error) {
    console.error("Error initializing database:", error);
  } finally {
    client.release();
    // await pool.end();
  }
}

function setDbLogger(pool: Pool) {
  pool.on("connect", () => {
    console.log("Client connected to pool");
    console.log("Pool size: ", pool.totalCount);
  });

  pool.on("remove", () => {
    console.log("Client removed from pool");
    console.log("Pool size: ", pool.totalCount);
  });

  pool.on("error", (error: Error) => {
    console.error("Unexpected error on idle client", error);
  });
}

/** 
 * https://node-postgres.com/

## PSQL table creation

CREATE TABLE ENVELOPES IF NOT EXISTS (
    id SERIAL PRIMARY KEY,           -- SERIAL is auto-incrementing integer
    title VARCHAR(100) NOT NULL,     -- VARCHAR with max length instead of string
    budget NUMERIC(10,2) NOT NULL,   -- NUMERIC for precise decimal calculations
    balance NUMERIC(10,2) NOT NULL   -- NUMERIC for precise decimal calculations
);

CREATE TABLE TRANSACTIONS IF NOT EXISTS (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL,              -- DATE type for date values
    amount NUMERIC(10,2) NOT NULL,   -- NUMERIC for precise decimal calculations
    description TEXT,                -- TEXT for variable-length strings
    envelope_id INTEGER NOT NULL REFERENCES ENVELOPES(id)  -- INTEGER for FK
);

https://github.com/riascho/postgres-node-express-API-example/blob/main/db.js

- initialize db with tables upon app launch
- add trigger to TRANSACTIONS table to update ENVELOPES balance via envelopeId
- write functions that make db queries when endpoint is called
*/
