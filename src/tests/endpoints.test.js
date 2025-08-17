"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const server_1 = require("../src/server");
const envelope_router_1 = require("../src/routers/envelope-router");
const transaction_router_1 = require("../src/routers/transaction-router");
server_1.app.use("/envelopes", envelope_router_1.envelopeRouter);
server_1.app.use("/transactions", transaction_router_1.transactionRouter);
describe("Envelope Endpoints", () => {
    describe("GET /envelopes", () => {
        it("should return empty array when no envelopes exist", async () => {
            const response = await (0, supertest_1.default)(server_1.app).get("/envelopes");
            expect(response.status).toBe(200);
            expect(response.body).toEqual([]);
        });
        it("should return all envelopes when they exist", async () => {
            await (0, supertest_1.default)(server_1.app)
                .post("/envelopes")
                .send({ title: "Groceries", budget: 500.0 });
            const response = await (0, supertest_1.default)(server_1.app).get("/envelopes");
            expect(response.status).toBe(200);
            expect(response.body).toHaveLength(1);
            expect(response.body[0]).toMatchObject({
                title: "Groceries",
                budget: "500.00",
            });
        });
    });
    describe("POST /envelopes", () => {
        it("should create a new envelope with valid data", async () => {
            const newEnvelope = { title: "Entertainment", budget: 200.5 };
            const response = await (0, supertest_1.default)(server_1.app).post("/envelopes").send(newEnvelope);
            expect(response.status).toBe(201);
            expect(response.body).toMatchObject({
                title: "Entertainment",
                budget: "200.50",
            });
            expect(response.body.id).toBeDefined();
        });
        it("should return 400 for missing title", async () => {
            const response = await (0, supertest_1.default)(server_1.app)
                .post("/envelopes")
                .send({ budget: 100 });
            expect(response.status).toBe(400);
        });
        it("should return 400 for missing budget", async () => {
            const response = await (0, supertest_1.default)(server_1.app)
                .post("/envelopes")
                .send({ title: "Test" });
            expect(response.status).toBe(400);
        });
    });
    describe("GET /envelopes/:id", () => {
        it("should return a specific envelope by id", async () => {
            const createResponse = await (0, supertest_1.default)(server_1.app)
                .post("/envelopes")
                .send({ title: "Travel", budget: 1000.0 });
            const envelopeId = createResponse.body.id;
            const response = await (0, supertest_1.default)(server_1.app).get(`/envelopes/${envelopeId}`);
            expect(response.status).toBe(200);
            expect(response.body).toMatchObject({
                id: envelopeId,
                title: "Travel",
                budget: "1000.00",
            });
        });
        it("should return 404 for non-existent envelope", async () => {
            const response = await (0, supertest_1.default)(server_1.app).get("/envelopes/999");
            expect(response.status).toBe(404);
        });
    });
    describe("PUT /envelopes/:id", () => {
        it("should update an existing envelope", async () => {
            const createResponse = await (0, supertest_1.default)(server_1.app)
                .post("/envelopes")
                .send({ title: "Food", budget: 300.0 });
            const envelopeId = createResponse.body.id;
            const response = await (0, supertest_1.default)(server_1.app)
                .put(`/envelopes/${envelopeId}`)
                .send({ title: "Groceries", budget: 400.0 });
            expect(response.status).toBe(200);
            expect(response.body).toMatchObject({
                id: envelopeId,
                title: "Groceries",
                budget: "400.00",
            });
        });
        it("should return 404 for non-existent envelope", async () => {
            const response = await (0, supertest_1.default)(server_1.app)
                .put("/envelopes/999")
                .send({ title: "Test", budget: 100 });
            expect(response.status).toBe(404);
        });
    });
    describe("DELETE /envelopes/:id", () => {
        it("should delete an existing envelope", async () => {
            const createResponse = await (0, supertest_1.default)(server_1.app)
                .post("/envelopes")
                .send({ title: "Utilities", budget: 150.0 });
            const envelopeId = createResponse.body.id;
            const response = await (0, supertest_1.default)(server_1.app).delete(`/envelopes/${envelopeId}`);
            expect(response.status).toBe(204);
            const getResponse = await (0, supertest_1.default)(server_1.app).get(`/envelopes/${envelopeId}`);
            expect(getResponse.status).toBe(404);
        });
        it("should return 404 for non-existent envelope", async () => {
            const response = await (0, supertest_1.default)(server_1.app).delete("/envelopes/999");
            expect(response.status).toBe(404);
        });
    });
    describe("POST /envelopes/:fromId/:toId (transfer budget)", () => {
        it("should transfer budget between envelopes", async () => {
            const envelope1 = await (0, supertest_1.default)(server_1.app)
                .post("/envelopes")
                .send({ title: "Source", budget: 500.0 });
            const envelope2 = await (0, supertest_1.default)(server_1.app)
                .post("/envelopes")
                .send({ title: "Target", budget: 200.0 });
            const response = await (0, supertest_1.default)(server_1.app)
                .post(`/envelopes/${envelope1.body.id}/${envelope2.body.id}`)
                .send({ amount: 100.0 });
            expect(response.status).toBe(200);
            const sourceCheck = await (0, supertest_1.default)(server_1.app).get(`/envelopes/${envelope1.body.id}`);
            const targetCheck = await (0, supertest_1.default)(server_1.app).get(`/envelopes/${envelope2.body.id}`);
            expect(parseFloat(sourceCheck.body.budget)).toBe(400.0);
            expect(parseFloat(targetCheck.body.budget)).toBe(300.0);
        });
        it("should return 400 when insufficient funds", async () => {
            const envelope1 = await (0, supertest_1.default)(server_1.app)
                .post("/envelopes")
                .send({ title: "Source", budget: 50.0 });
            const envelope2 = await (0, supertest_1.default)(server_1.app)
                .post("/envelopes")
                .send({ title: "Target", budget: 200.0 });
            const response = await (0, supertest_1.default)(server_1.app)
                .post(`/envelopes/${envelope1.body.id}/${envelope2.body.id}`)
                .send({ amount: 100.0 });
            expect(response.status).toBe(400);
        });
    });
    describe("POST /envelopes/:id (makeTransaction)", () => {
        it("should create a new transaction with valid data", async () => {
            const newTransaction = {
                date: "2024-01-15",
                amount: 30.75,
                description: "Grocery store",
                envelope_id: 1,
            };
            const response = await (0, supertest_1.default)(server_1.app)
                .post(`/envelopes/${newTransaction.envelope_id}`)
                .send(newTransaction);
            expect(response.status).toBe(201);
            expect(response.body).toMatchObject({
                amount: "30.75",
                description: "Grocery store",
                envelope_id: 1,
            });
            expect(response.body.id).toBeDefined();
        });
        it("should return 400 for invalid envelope_id", async () => {
            const response = await (0, supertest_1.default)(server_1.app).post("/transactions").send({
                date: "2024-01-15",
                amount: 25.5,
                description: "Test",
                envelope_id: 999,
            });
            expect(response.status).toBe(400);
        });
        it("should return 400 for missing required fields", async () => {
            const response = await (0, supertest_1.default)(server_1.app).post("/transactions").send({
                amount: 25.5,
                description: "Test",
            });
            expect(response.status).toBe(400);
        });
    });
});
describe("Transaction Endpoints", () => {
    let envelopeId;
    beforeEach(async () => {
        const envelope = await (0, supertest_1.default)(server_1.app)
            .post("/envelopes")
            .send({ title: "Test Envelope", budget: 500.0 });
        envelopeId = envelope.body.id;
    });
    describe("GET /transactions", () => {
        it("should return empty array when no transactions exist", async () => {
            const response = await (0, supertest_1.default)(server_1.app).get("/transactions");
            expect(response.status).toBe(200);
            expect(response.body).toEqual([]);
        });
        it("should return all transactions when they exist", async () => {
            await (0, supertest_1.default)(server_1.app).post("/transactions").send({
                date: "2024-01-15",
                amount: 25.5,
                description: "Coffee shop",
                envelope_id: envelopeId,
            });
            const response = await (0, supertest_1.default)(server_1.app).get("/transactions");
            expect(response.status).toBe(200);
            expect(response.body).toHaveLength(1);
            expect(response.body[0]).toMatchObject({
                amount: "25.50",
                description: "Coffee shop",
                envelope_id: envelopeId,
            });
        });
    });
    describe("GET /transactions/:id", () => {
        it("should return a specific transaction by id", async () => {
            const createResponse = await (0, supertest_1.default)(server_1.app).post("/transactions").send({
                date: "2024-01-15",
                amount: 45.25,
                description: "Gas station",
                envelope_id: envelopeId,
            });
            const transactionId = createResponse.body.id;
            const response = await (0, supertest_1.default)(server_1.app).get(`/transactions/${transactionId}`);
            expect(response.status).toBe(200);
            expect(response.body).toMatchObject({
                id: transactionId,
                amount: "45.25",
                description: "Gas station",
                envelope_id: envelopeId,
            });
        });
        it("should return 404 for non-existent transaction", async () => {
            const response = await (0, supertest_1.default)(server_1.app).get("/transactions/999");
            expect(response.status).toBe(404);
        });
    });
    describe("PUT /transactions/:id", () => {
        it("should update an existing transaction", async () => {
            const createResponse = await (0, supertest_1.default)(server_1.app).post("/transactions").send({
                date: "2024-01-15",
                amount: 20.0,
                description: "Original description",
                envelope_id: envelopeId,
            });
            const transactionId = createResponse.body.id;
            const response = await (0, supertest_1.default)(server_1.app)
                .put(`/transactions/${transactionId}`)
                .send({
                date: "2024-01-16",
                amount: 25.0,
                description: "Updated description",
                envelope_id: envelopeId,
            });
            expect(response.status).toBe(200);
            expect(response.body).toMatchObject({
                id: transactionId,
                amount: "25.00",
                description: "Updated description",
                envelope_id: envelopeId,
            });
        });
        it("should return 404 for non-existent transaction", async () => {
            const response = await (0, supertest_1.default)(server_1.app).put("/transactions/999").send({
                date: "2024-01-15",
                amount: 25.0,
                description: "Test",
                envelope_id: envelopeId,
            });
            expect(response.status).toBe(404);
        });
    });
    describe("DELETE /transactions/:id", () => {
        it("should delete an existing transaction", async () => {
            const createResponse = await (0, supertest_1.default)(server_1.app).post("/transactions").send({
                date: "2024-01-15",
                amount: 15.75,
                description: "To be deleted",
                envelope_id: envelopeId,
            });
            const transactionId = createResponse.body.id;
            const response = await (0, supertest_1.default)(server_1.app).delete(`/transactions/${transactionId}`);
            expect(response.status).toBe(204);
            const getResponse = await (0, supertest_1.default)(server_1.app).get(`/transactions/${transactionId}`);
            expect(getResponse.status).toBe(404);
        });
        it("should return 404 for non-existent transaction", async () => {
            const response = await (0, supertest_1.default)(server_1.app).delete("/transactions/999");
            expect(response.status).toBe(404);
        });
    });
});
//# sourceMappingURL=endpoints.test.js.map