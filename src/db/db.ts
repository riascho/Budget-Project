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

import { Pool, PoolClient, PoolConfig } from "pg";
import dotenv from "dotenv";
dotenv.config(); // load .env file

const dbConfig: PoolConfig = {
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: parseInt(process.env.PGPORT ?? "5432"),
};

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
  const pool: Pool = new Pool(config);
  setDbLogger(pool);

  const client: PoolClient = await pool.connect();
  client.query(`CREATE TABLE ENVELOPES IF NOT EXISTS (
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
);`);

  client.release();
  await pool.end();
}

export function setDbLogger(pool: Pool) {
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

initializeDb(dbConfig);
