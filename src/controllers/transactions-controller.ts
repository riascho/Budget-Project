import { type RequestHandler, type RequestParamHandler } from "express";
import { pool } from "../db/db";
// import { Transaction } from "../models/transaction";

async function findTransactionIndex(id: string): Promise<number | undefined> {
  try {
    const dbResponse = await pool.query(
      "SELECT id FROM transactions WHERE id = $1",
      [id]
    );
    if (dbResponse.rows.length === 0) {
      throw new Error(`Transaction ID ${id} not found!`);
    }
    return dbResponse.rows[0].id;
  } catch (error) {
    console.error(error);
  }
}

export const setTransactionIndex: RequestParamHandler = async (
  req,
  res,
  next,
  id
) => {
  try {
    const foundIndex = await findTransactionIndex(id);
    if (!foundIndex) {
      return res
        .status(404)
        .json({ message: `Couldn't find Transaction id: ${id}` });
    }
    req.validatedTransactionIndex = foundIndex as number;
    next();
  } catch (error) {
    console.error(error);
    res.status(500).send("Error setting transaction index");
  }
};

export const getAllTransactions: RequestHandler = async (_req, res) => {
  try {
    const queryResponse = await pool.query("SELECT * FROM transactions");
    res.status(200).json(queryResponse.rows);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error fetching transactions");
  }
};

export const getSingleTransaction: RequestHandler = async (req, res) => {
  try {
    const queryResponse = await pool.query(
      "SELECT * FROM transactions WHERE id = $1",
      [req.validatedTransactionIndex]
    );
    res.status(200).json(queryResponse.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error fetching transaction");
  }
};

// TODO: when transaction is deleted, envelope balance needs to be updated too!!!
export const deleteTransaction: RequestHandler<{ id: string }> = async (
  req,
  res
) => {
  try {
    const queryResponse = await pool.query(
      "DELETE FROM transactions WHERE id = $1",
      [req.validatedTransactionIndex]
    );
    if (queryResponse.rowCount === 0) {
      res.status(404).json({ message: `Nothing deleted!` });
      throw new Error(
        `Transaction ID ${req.validatedTransactionIndex} could not be deleted!`
      );
    }
    if (queryResponse.rowCount === 1) {
      res.status(200).send(`Deleted ${queryResponse.rowCount} Row.`);
    } else {
      res.status(200).send(`Deleted ${queryResponse.rowCount} Rows.`);
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Error deleting transaction");
  }
};

// make sure envelope balance is also updated with transaction update
export const updateTransaction: RequestHandler<{ id: string }> = async (
  req,
  res
) => {
  try {
    // 0. Validate if proper request made TODO: DRY!!!!
    const parsedBody: {
      description?: string;
      amount?: number;
      date?: string;
    } = req.body;
    console.log(parsedBody);
    if (!parsedBody.description && !parsedBody.amount && !parsedBody.date) {
      res.status(400).json({
        message:
          "You need to send a 'description' (string) or 'amount' (number) or 'date' (string) property in the request body to update transaction!",
      });
      return;
    }

    // 1. Validate Transaction TODO: DRY!!!!
    const foundTransactionResponse = await pool.query(
      "SELECT * FROM transactions WHERE id = $1",
      [req.validatedTransactionIndex]
    );
    if (foundTransactionResponse.rowCount === 0) {
      res.status(404).json({
        message: `Transaction ID ${req.validatedTransactionIndex} not found!`,
      });
      throw new Error(
        `Transaction ID ${req.validatedTransactionIndex} not found!`
      );
    }
    if (parsedBody.description) {
      await pool.query(
        `UPDATE transactions SET description = $1 WHERE id =$2`,
        [parsedBody.description, req.validatedTransactionIndex]
      );
    }
    if (parsedBody.amount) {
      const targetEnvelope = await pool.query(
        "SELECT * FROM envelopes WHERE id=$1",
        [foundTransactionResponse.rows[0].envelope_id]
      );
      const envelopeBalance = targetEnvelope.rows[0].balance;
      console.log(envelopeBalance);
      const oldTransactionAmount = foundTransactionResponse.rows[0].amount;
      console.log(oldTransactionAmount);
      const newTransactionAmount = parsedBody.amount;
      console.log(newTransactionAmount);

      if (envelopeBalance + oldTransactionAmount - newTransactionAmount < 0) {
        res.status(403).json({
          message: `Cannot change amount, because envelope balance will be negative!`,
          envelope: targetEnvelope.rows[0],
        });
        return;
      }
      await pool.query(`UPDATE transactions SET amount = $1 WHERE id =$2`, [
        parsedBody.amount,
        req.validatedTransactionIndex,
      ]);
      await pool.query(
        `UPDATE envelopes SET balance = balance + $1 WHERE id =$2`,
        [parsedBody.amount, targetEnvelope.rows[0].id]
      );
    }
    if (parsedBody.date) {
      await pool.query(`UPDATE transactions SET date = $1 WHERE id =$2`, [
        parsedBody.date,
        req.validatedTransactionIndex,
      ]);
    }
    res
      .status(200)
      .send(`Transaction ID ${req.validatedTransactionIndex} updated!`);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error updating transaction");
  }
};
