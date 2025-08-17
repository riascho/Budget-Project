import request from "supertest"; // SuperTest works by making requests directly to your Express app without actually starting a server on a port. It simulates HTTP requests internally, so there's no actual TCP connection to clean up.
import Express from "express";
import { envelopeRouter } from "../routers/envelope-router";
import { transactionRouter } from "../routers/transaction-router";

const app = Express();
app.use(Express.json());
app.use("/envelopes", envelopeRouter);
app.use("/transactions", transactionRouter);

describe("Middleware Tests", () => {
  it("should verify that envelopeId is a number before setting it as validated index", async () => {
    // req.validatedEnvelopeIndex = foundIndex as number;
  });

  it("should return 404 when accessing non-existent envelope", async () => {
    const response = await request(app).get("/envelopes/999");
    expect(response.status).toBe(404);
    expect(response.body.message).toBe("Couldn't find Envelope id: 999");
  });

  it("should verify that transactionId is a number before setting it as validated index", async () => {
    // req.validatedTransactionIndex = foundIndex as number;
  });

  it("should return 404 when accessing non-existent transaction", async () => {
    const response = await request(app).put("/transactions/999").send({
      date: "2024-01-15",
      amount: 25.0,
      description: "Test",
    });

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("Couldn't find Transaction id: 999");
  });
});
