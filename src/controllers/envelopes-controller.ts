import { type RequestHandler, type RequestParamHandler } from "express";
import { Envelope } from "../models/envelope";
import { Transaction } from "../models/transaction";
import { pool } from "../db/db";

async function findEnvelopeIndex(id: string): Promise<number | undefined> {
  try {
    const queryResponse = await pool.query(
      "SELECT id FROM envelopes WHERE id = $1",
      [id]
    );
    if (queryResponse.rows.length === 0) {
      throw new Error(`Envelope ID ${id} not found!`);
    } else {
      return queryResponse.rows[0].id;
    }
  } catch (error) {
    console.error(error);
  }
  return undefined;
}

// Middleware that sets request object property
export const setEnvelopeIndex: RequestParamHandler = async (
  req,
  res,
  next,
  id
) => {
  try {
    const foundIndex = await findEnvelopeIndex(id);
    if (!foundIndex) {
      return res
        .status(404)
        .json({ message: `Couldn't find Envelope id: ${id}` });
    }
    req.validatedEnvelopeIndex = foundIndex as number;
    next();
  } catch (error) {
    console.error(error);
    res.status(500).send("Error setting envelope index");
  }
};

export const getAllEnvelopes: RequestHandler = async (_req, res) => {
  try {
    const queryResponse = await pool.query("SELECT * FROM envelopes");
    res.status(200).json(queryResponse.rows);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error fetching envelopes");
  }
};

export const createEnvelope: RequestHandler = async (req, res) => {
  try {
    const parsedBody: { title: string; budget: number } = req.body; // TODO: improve body parsing and validation
    if (parsedBody.title && parsedBody.budget) {
      const envelope = new Envelope(parsedBody.title, parsedBody.budget);
      const queryResponse = await pool.query(
        "INSERT INTO ENVELOPES (title, budget, balance) VALUES ($1, $2, $3)",
        [envelope.title, envelope.budget, envelope.balance]
      );
      res.status(201).send(`Envelope created!\n${JSON.stringify(parsedBody)}`);
      console.log(queryResponse);
    } else {
      res
        .status(400)
        .send(`Could not create envelope\n${JSON.stringify(parsedBody)}`);
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Error creating envelope");
  }
};

export const getSingleEnvelope: RequestHandler = async (req, res) => {
  try {
    const queryResponse = await pool.query(
      "SELECT * FROM envelopes WHERE id = $1",
      [req.validatedEnvelopeIndex]
    );
    res.status(200).json(queryResponse.rows[0]); // here we don't instantiate new Envelope (but in the transferBudget endpoint we do, because we need the .updateBudget method) -> TODO: implement consistency here for consistent interface to send to frontend
  } catch (error) {
    console.error(error);
    res.status(500).send("Error fetching envelope");
  }
};

export const deleteEnvelope: RequestHandler<{ id: string }> = async (
  req,
  res
) => {
  try {
    const queryResponse = await pool.query(
      "DELETE FROM envelopes WHERE id = $1",
      [req.validatedEnvelopeIndex]
    );
    if (queryResponse.rowCount === 0) {
      res.status(404).json({ message: `Nothing deleted!` });
      throw new Error(
        `Envelope ID ${req.validatedEnvelopeIndex} could not be deleted!`
      );
    }
    if (queryResponse.rowCount === 1) {
      res.status(200).send(`Deleted ${queryResponse.rowCount} Row.`);
    } else {
      res.status(200).send(`Deleted ${queryResponse.rowCount} Rows.`);
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Error deleting envelope");
  }
};

export const updateEnvelope: RequestHandler<{ id: string }> = async (
  req,
  res
) => {
  try {
    // 0. Validate if proper request made TODO: DRY!!!!
    const parsedBody: { title?: string; budget?: number } = req.body;
    if (parsedBody.title === undefined && parsedBody.budget === undefined) {
      res.status(400).json({
        message:
          "You need to send a 'title' (string) or 'budget' (number) property in the request body to update envelope!",
      });
      return;
    }

    // 1. Validate Envelope TODO: DRY!!!!
    const foundEnvelopeResponse = await pool.query(
      "SELECT * FROM envelopes WHERE id = $1",
      [req.validatedEnvelopeIndex]
    );
    if (foundEnvelopeResponse.rowCount === 0) {
      res.status(404).json({
        message: `Envelope ID ${req.validatedEnvelopeIndex} not found!`,
      });
      throw new Error(`Envelope ID ${req.validatedEnvelopeIndex} not found!`);
    }
    const { id, title, budget, balance } = foundEnvelopeResponse.rows[0];
    // TODO: DRY!!!!
    const foundEnvelope: Envelope = new Envelope(title, parseInt(budget));
    foundEnvelope.id = id;
    foundEnvelope.balance = parseInt(balance);

    if (parsedBody.budget && !isNaN(parsedBody.budget)) {
      if (foundEnvelope.setBudget(parsedBody.budget) < 0) {
        res.status(403).json({
          message: "Budget cannot be negative!",
        });
        return;
      }
      await pool.query("UPDATE envelopes SET budget = $1 WHERE id = $2", [
        foundEnvelope.budget,
        foundEnvelope.id,
      ]);
    }

    if (parsedBody.title && typeof parsedBody.title === "string") {
      if (parsedBody.title === "") {
        res.status(403).json({
          message: "Title cannot be empty!",
        });
        return;
      }
      await pool.query("UPDATE envelopes SET title = $1 WHERE id =$2", [
        parsedBody.title,
        foundEnvelope.id,
      ]);
    }

    res.status(200).send(`Envelope "${foundEnvelope.title}" updated!`);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error updating envelope");
  }
};

export const makeTransaction: RequestHandler<{ id: string }> = async (
  req,
  res
) => {
  try {
    // 0. Validate if proper request made TODO: DRY!!!!
    const envelopeId = parseInt(req.params.id);
    if (isNaN(envelopeId)) {
      res.status(400).json({ message: "Invalid envelope ID" });
      return;
    } // TODO: this should be handled by setEnvelopeIndex middleware

    const parsedBody: { date?: string; description?: string; amount?: number } =
      req.body;
    if (
      parsedBody.date === undefined ||
      parsedBody.description === undefined ||
      parsedBody.amount === undefined
    ) {
      res.status(400).json({
        message:
          "You need to send a 'date' (string), description (string) and 'amount' (number) property in the request body to make a transaction!",
      });
      return;
    }
    const { date, amount, description } = req.body;
    // TODO: better date handling
    const newTransaction = new Transaction(
      date,
      amount,
      description,
      envelopeId
    );

    // 1. Validate and Update Envelope balance
    const foundEnvelopeResponse = await pool.query(
      "SELECT * FROM envelopes WHERE id = $1",
      [req.validatedEnvelopeIndex]
    );
    if (foundEnvelopeResponse.rowCount === 0) {
      res.status(404).json({
        message: `Envelope ID ${req.validatedEnvelopeIndex} not found!`,
      });
      throw new Error(`Envelope ID ${req.validatedEnvelopeIndex} not found!`);
    }
    const { id, title, budget, balance } = foundEnvelopeResponse.rows[0];
    // TODO: DRY!!!!
    const foundEnvelope = new Envelope(title, parseInt(budget));
    foundEnvelope.id = id;
    foundEnvelope.balance = parseInt(balance);

    const newBalance = foundEnvelope.updateBalance(newTransaction.amount);
    if (newBalance < 0) {
      res.status(403).json({
        message: `Extracting $${Math.abs(
          newTransaction.amount
        )} will exceed your current balance by $${Math.abs(
          newBalance
        )}! Please access less or increase balance!`,
      });
    }
    await pool.query("UPDATE envelopes SET balance = $1 WHERE id = $2", [
      newBalance,
      envelopeId,
    ]);
    res.status(200).send(`Envelope "${foundEnvelope.title}" updated!`);

    // 2. Register Transaction in transactions table (only if balance allows it!)
    await pool.query(
      "INSERT INTO transactions (date, amount, description, envelope_id) VALUES ($1, $2, $3, $4)",
      [
        newTransaction.date,
        newTransaction.amount,
        newTransaction.description,
        newTransaction.envelopeId,
      ]
    );

    // TODO: need to make sure that balance update is rolled back if transaction insert fails
  } catch (error) {
    console.error(error);
    res.status(500).send("Error making transaction");
  }
};

export const transferBudget: RequestHandler<{
  fromId: string;
  toId: string;
}> = async (req, res) => {
  const fromIndex = await findEnvelopeIndex(req.params.fromId);
  const toIndex = await findEnvelopeIndex(req.params.toId);

  if (!fromIndex) {
    res
      .status(404)
      .json({ message: `Couldn't find Envelope id: ${req.params.fromId}` });
    return;
  }
  if (!toIndex) {
    res
      .status(404)
      .json({ message: `Couldn't find Envelope id: ${req.params.toId}` });
    return;
  }

  const fromEnvelopeResponse = await pool.query(
    "SELECT * FROM envelopes WHERE id = $1",
    [fromIndex]
  );
  const fromEnvelope = new Envelope(
    fromEnvelopeResponse.rows[0].title,
    parseFloat(fromEnvelopeResponse.rows[0].budget),
    fromEnvelopeResponse.rows[0].id,
    parseFloat(fromEnvelopeResponse.rows[0].balance)
  );
  // TODO: instead of positional arguments, we should modify the constructor to accept object parameters so we can use named parameters for better readability and maintainability.
  // This would look like this:
  // const fromEnvelope = new Envelope({       <-- note the object!
  //   id: fromEnvelopeResponse.rows[0].id,
  //   title: fromEnvelopeResponse.rows[0].title,
  //   budget: fromEnvelopeResponse.rows[0].budget,
  // });

  const toEnvelopeResponse = await pool.query(
    "SELECT * FROM envelopes WHERE id = $1",
    [toIndex]
  );
  const toEnvelope = new Envelope(
    toEnvelopeResponse.rows[0].title,
    parseFloat(toEnvelopeResponse.rows[0].budget), // node-postgres (pg) returns PostgreSQL NUMERIC type as a JavaScript string by default to preserve precision. JavaScript's Number type can't safely represent all values that a NUMERIC field can hold without potential precision loss.
    toEnvelopeResponse.rows[0].id,
    parseFloat(toEnvelopeResponse.rows[0].balance)
  );

  const amount = Math.abs(Number.parseInt(req.headers?.amount as string)); // TODO: use generic type, put amount in body?

  if (!amount || isNaN(amount)) {
    res.status(400).json({
      message: "You need to send an 'amount' in the request header!",
    });
    return;
  }

  if (fromEnvelope.budget < amount) {
    res.status(403).json({
      message: `Not enough budget in envelope ${fromEnvelope.title.toUpperCase()} to transfer $${amount}! Current budget: $${
        fromEnvelope.budget
      }`,
    });
    return;
  }

  fromEnvelope.updateBudget(-amount);
  toEnvelope.updateBudget(amount);

  await pool.query("UPDATE envelopes SET budget =$1 WHERE id = $2", [
    fromEnvelope.budget,
    fromEnvelope.id,
  ]);
  await pool.query("UPDATE envelopes SET budget =$1 WHERE id =$2", [
    toEnvelope.budget,
    toEnvelope.id,
  ]);

  res.status(200).json({
    message: `Transferred $${amount} from envelope ${fromEnvelope.title.toUpperCase()} to envelope ${toEnvelope.title.toUpperCase()}`,
  });
};
