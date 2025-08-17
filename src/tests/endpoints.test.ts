import request from "supertest"; // SuperTest works by making requests directly to your Express app without actually starting a server on a port. It simulates HTTP requests internally, so there's no actual TCP connection to clean up.
import Express from "express";
import { envelopeRouter } from "../routers/envelope-router";
import { transactionRouter } from "../routers/transaction-router";

const app = Express();
app.use(Express.json());
app.use("/envelopes", envelopeRouter);
app.use("/transactions", transactionRouter);

describe("Envelope Endpoints", () => {
  describe("GET /envelopes", () => {
    it("should return empty array when no envelopes exist", async () => {
      const response = await request(app).get("/envelopes");
      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });

    it("should return all envelopes when they exist", async () => {
      await request(app)
        .post("/envelopes")
        .send({ title: "Groceries", budget: 500.0 });

      const response = await request(app).get("/envelopes");
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

      const response = await request(app).post("/envelopes").send(newEnvelope);

      expect(response.status).toBe(201);
      expect(response.text).toEqual(
        `Envelope created!\n${JSON.stringify(newEnvelope)}`
      );
    });

    it("should return 400 for missing title", async () => {
      const response = await request(app)
        .post("/envelopes")
        .send({ budget: 100 });

      expect(response.status).toBe(400);
    });

    it("should return 400 for missing budget", async () => {
      const response = await request(app)
        .post("/envelopes")
        .send({ title: "Test" });

      expect(response.status).toBe(400);
    });
  });

  describe("GET /envelopes/:id", () => {
    it("should return a specific envelope by id", async () => {
      await request(app)
        .post("/envelopes")
        .send({ title: "Travel", budget: 1000.0 });

      // assumes the envelope created will get ID 1
      const response = await request(app).get(`/envelopes/1`);
      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        id: 1,
        title: "Travel",
        budget: "1000.00",
        balance: "1000.00",
      });
    });
  });

  describe("PUT /envelopes/:id", () => {
    it("should update an existing envelope", async () => {
      await request(app)
        .post("/envelopes")
        .send({ title: "Food", budget: 300.0 });

      const response = await request(app)
        .put(`/envelopes/1`)
        .send({ title: "Groceries", budget: 400.0 });

      expect(response.status).toBe(200);
      expect(response.text).toEqual(`Envelope "Food" updated!`);
    });
  });

  describe("DELETE /envelopes/:id", () => {
    it("should delete an existing envelope", async () => {
      await request(app)
        .post("/envelopes")
        .send({ title: "Utilities", budget: 150.0 });

      const response = await request(app).delete(`/envelopes/1`);
      expect(response.status).toBe(204);

      const getResponse = await request(app).get(`/envelopes/1`);
      expect(getResponse.status).toBe(404);
    });
  });

  describe("POST /envelopes/:fromId/:toId (transfer budget)", () => {
    it("should transfer budget between envelopes", async () => {
      // creates test envelopes
      await request(app)
        .post("/envelopes")
        .send({ title: "Source", budget: 500.0 });

      await request(app)
        .post("/envelopes")
        .send({ title: "Target", budget: 200.0 });

      // we are assuming that the just created envelopes have id 1 and 2
      const response = await request(app)
        .post(`/envelopes/1/2`)
        .set("amount", "100.0"); // setting amount in header instead of body (.send)

      expect(response.status).toBe(200);

      const sourceCheck = await request(app).get(`/envelopes/1`);
      const targetCheck = await request(app).get(`/envelopes/2`);

      expect(parseFloat(sourceCheck.body.budget)).toBe(400.0);
      expect(parseFloat(targetCheck.body.budget)).toBe(300.0);
    });

    it("should return 403 when insufficient funds", async () => {
      await request(app)
        .post("/envelopes")
        .send({ title: "Source", budget: 50.0 });

      await request(app)
        .post("/envelopes")
        .send({ title: "Target", budget: 200.0 });

      const response = await request(app)
        .post(`/envelopes/1/2`)
        .set("amount", "100.0"); // setting amount in header instead of body (.send)

      expect(response.status).toBe(403);
      expect(response.body.message).toBe(
        `Not enough budget in envelope SOURCE to transfer $100! Current budget: $50`
      );
    });
  });

  describe("POST /envelopes/:id (makeTransaction)", () => {
    it("should create a new transaction with valid data", async () => {
      await request(app)
        .post("/envelopes")
        .send({ title: "Test Envelope", budget: 500.0 });

      const newTransaction = {
        date: "2024-01-15",
        amount: 30.75,
        description: "Grocery store",
        envelope_id: 1,
      };

      const response = await request(app)
        .post(`/envelopes/${newTransaction.envelope_id}`)
        .send(newTransaction);

      expect(response.status).toBe(201);
      expect(response.body.transaction).toMatchObject({
        amount: "30.75",
        description: "Grocery store",
        envelope_id: 1,
      });
      expect(response.body.transaction.id).toBeDefined();
    });
  });
});

describe("Transaction Endpoints", () => {
  beforeEach(async () => {
    await request(app)
      .post("/envelopes")
      .send({ title: "Test Envelope", budget: 500.0 });
    // will have ID 1
  });

  describe("GET /transactions", () => {
    it("should return empty array when no transactions exist", async () => {
      const response = await request(app).get("/transactions");
      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });

    // make test transactions
    it("should return all transactions when they exist", async () => {
      await request(app).post("/envelopes/1").send({
        date: "2024-01-15",
        amount: 25.5,
        description: "Coffee shop",
      });
      await request(app).post("/envelopes/1").send({
        date: "2024-01-16",
        amount: 49.99,
        description: "Hotel Bar",
      });

      const response = await request(app).get("/transactions");
      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
      expect(response.body).toEqual([
        {
          id: 1,
          date: "2024-01-14T23:00:00.000Z",
          amount: 25.5,
          description: "Coffee shop",
          envelopeId: 1,
        },
        {
          id: 2,
          date: "2024-01-15T23:00:00.000Z",
          amount: 49.99,
          description: "Hotel Bar",
          envelopeId: 1,
        },
      ]);
      //       const transaction = new Transaction(
      //     row.date,
      //     parseFloat(row.amount),
      //     row.description,
      //     row.envelope_id
      //   );
      //   transaction.id = row.id;
      //   return transaction;
      // });

      // res.status(200).json(transactions);
    });
  });

  describe("GET /transactions/:id", () => {
    it("should return a specific transaction by id", async () => {
      // create a test transaction
      await request(app).post("/envelopes/1").send({
        date: "2024-01-15",
        amount: 45.25,
        description: "Gas station",
      });

      const response = await request(app).get(`/transactions/1`);
      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        id: 1,
        amount: 45.25,
        description: "Gas station",
        envelopeId: 1,
      });
    });
  });

  describe("PUT /transactions/:id", () => {
    it("should update an existing transaction", async () => {
      // create a test transaction
      const createResponse = await request(app).post("/envelopes/1").send({
        date: "2024-01-15",
        amount: 20.0,
        description: "Original description",
      });

      const transactionId = createResponse.body.transaction.id;

      const response = await request(app)
        .put(`/transactions/${transactionId}`)
        .send({
          date: "2024-01-16",
          amount: 25.0,
          description: "Updated description",
        });

      expect(response.status).toBe(200);
      expect(response.body.transaction).toMatchObject({
        id: transactionId,
        date: "2024-01-15T23:00:00.000Z",
        amount: 25,
        description: "Updated description",
        envelopeId: 1,
      });
    });

    it("should return 400 if updated description is empty", async () => {
      const createResponse = await request(app).post("/envelopes/1").send({
        date: "2024-01-15",
        amount: 20.0,
        description: "Original description",
      });

      const transactionId = createResponse.body.transaction.id;

      const updateTransactionResponse = await request(app)
        .put(`/transactions/${transactionId}`)
        .send({
          date: "2024-01-16",
          amount: 25.0,
          description: "",
        });

      expect(updateTransactionResponse.status).toBe(400);
      expect(updateTransactionResponse.body).toMatchObject({
        message: "Description cannot be empty!",
      });
    });

    it("should return 400 if no description, amount or date is given to update", async () => {
      const createResponse = await request(app).post("/envelopes/1").send({
        date: "2024-01-15",
        amount: 20.0,
        description: "Original description",
      });

      const transactionId = createResponse.body.transaction.id;

      const updateTransactionResponse = await request(app)
        .put(`/transactions/${transactionId}`)
        .send({});

      expect(updateTransactionResponse.status).toBe(400);
      expect(updateTransactionResponse.body).toMatchObject({
        message:
          "You need to update at least 'description' (string) or 'amount' (number) or 'date' (string)!",
      });
    });
  });

  describe("DELETE /transactions/:id", () => {
    it("should delete an existing transaction", async () => {
      // create a test transaction
      const transaction = await request(app).post("/envelopes/1").send({
        date: "2024-01-15",
        amount: 15.75,
        description: "To be deleted",
      });

      const response = await request(app).delete(
        `/transactions/${transaction.body.transaction.id}`
      );
      expect(response.status).toBe(200);
      expect(response.body.transaction).toEqual({
        id: 1,
        date: "2024-01-14T23:00:00.000Z",
        amount: 15.75,
        description: "To be deleted",
        envelopeId: 1,
      });
    });

    it("should rebalance envelope correctly after transaction was deleted", async () => {
      // create a test transaction
      const createResponse = await request(app).post("/envelopes/1").send({
        date: "2024-01-15",
        amount: 20.0,
        description: "Original description",
      });

      const transactionId = createResponse.body.transaction.id;

      const updatedEnvelope = await request(app).get("/envelopes/1");
      expect(updatedEnvelope.body.balance).toEqual("480.00");

      const deletionResponse = await request(app).delete(
        `/transactions/${transactionId}`
      );
      expect(deletionResponse.status).toBe(200);

      const envelopeResponse = await request(app).get("/envelopes/1");
      expect(envelopeResponse.status).toBe(200);
      expect(envelopeResponse.body.balance).toEqual("500.00");
    });
  });
});
