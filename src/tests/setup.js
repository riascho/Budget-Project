"use strict";
// this setup file is called in jest.config.js as setupFilesAfterEnv
Object.defineProperty(exports, "__esModule", { value: true });
const pg_1 = require("pg");
const db_1 = require("../src/db/db");
let adminPool;
const adminDbConfig = {
    user: process.env.PGUSER,
    host: process.env.PGHOST,
    database: "postgres", // connect to default postgres db for admin operations
    password: process.env.PGPASSWORD,
    port: parseInt(process.env.PGPORT ?? "5432"),
};
async function initTestDb() {
    adminPool = new pg_1.Pool(adminDbConfig);
    try {
        // Create test database
        await adminPool.query("DROP DATABASE IF EXISTS envelopes_test");
        await adminPool.query("CREATE DATABASE envelopes_test");
    }
    catch (error) {
        console.error("Error creating test database:", error);
        throw error;
    }
    // Close admin connection before using the main pool
    await adminPool.end();
    // Use main pool (which now connects to test db in test mode) to create tables
    try {
        await db_1.pool.query(db_1.tableCreationQuery);
    }
    catch (error) {
        console.error("Error creating test tables:", error);
        throw error;
    }
}
async function cleanupTestDb() {
    await db_1.pool.end();
    // Reconnect as admin to drop test database
    adminPool = new pg_1.Pool(adminDbConfig);
    try {
        await adminPool.query("DROP DATABASE IF EXISTS envelopes_test");
    }
    catch (error) {
        console.error("Error dropping test database:", error);
    }
    finally {
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
    await db_1.pool.query("DELETE FROM TRANSACTIONS");
    await db_1.pool.query("DELETE FROM ENVELOPES");
    await db_1.pool.query("ALTER SEQUENCE envelopes_id_seq RESTART WITH 1");
    await db_1.pool.query("ALTER SEQUENCE transactions_id_seq RESTART WITH 1");
});
//# sourceMappingURL=setup.js.map