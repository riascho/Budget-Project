// this setup file is called in jest.config.js as setupFilesAfterEnv

import { Pool, PoolConfig } from "pg";
import { pool, tableCreationQuery } from "../db/db";

let adminPool: Pool;

const adminDbConfig: PoolConfig = {
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: "postgres", // connect to default postgres db for admin operations
  password: process.env.PGPASSWORD,
  port: parseInt(process.env.PGPORT ?? "5432"),
};

async function initTestDb() {
  adminPool = new Pool(adminDbConfig);

  try {
    // Create test database
    try {
      await adminPool.query("DROP DATABASE IF EXISTS envelopes_test");
      console.log("Dropped test database");
    } catch (error) {
      console.error("Error dropping test database:", error);
    }
    await adminPool.query("CREATE DATABASE envelopes_test");
  } catch (error) {
    console.error("Error creating test database:", error);
    throw error;
  } finally {
    // Close admin connection before using the main pool
    await adminPool.end();
  }

  // Use main pool (which now connects to test db in test mode) to create tables
  try {
    await pool.query(tableCreationQuery);
  } catch (error) {
    console.error("Error creating test tables:", error);
    throw error;
  }
}

async function cleanupTestDb() {
  await pool.end();

  // Reconnect as admin to drop test database
  adminPool = new Pool(adminDbConfig);
  try {
    await adminPool.query("DROP DATABASE IF EXISTS envelopes_test");
  } catch (error) {
    console.error("Error dropping test database:", error);
  } finally {
    await adminPool.end();
  }
}

beforeAll(async () => {
  await initTestDb();
});

afterAll(async () => {
  await cleanupTestDb();
});

beforeEach(async () => {
  // Clean data between tests using main pool
  try {
    await pool.query("DELETE FROM TRANSACTIONS");
    await pool.query("DELETE FROM ENVELOPES");
    await pool.query("ALTER SEQUENCE envelopes_id_seq RESTART WITH 1");
    await pool.query("ALTER SEQUENCE transactions_id_seq RESTART WITH 1");
  } catch (error) {
    console.error("Error resetting data between tests:", error);
  }
});
