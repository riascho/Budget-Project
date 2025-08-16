import { type RequestHandler, type RequestParamHandler } from "express";
import { pool } from "../db/db";
import { Transaction } from "../models/transaction";

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

    const transactions = queryResponse.rows.map((row) => {
      const transaction = new Transaction(
        row.date,
        parseFloat(row.amount),
        row.description,
        row.envelope_id
      );
      transaction.id = row.id;
      return transaction;
    });

    res.status(200).json(transactions);
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

    if (queryResponse.rowCount === 0) {
      res.status(404).json({ message: "Transaction not found" });
      return;
    }

    const row = queryResponse.rows[0];
    const transaction = new Transaction(
      row.date,
      parseFloat(row.amount),
      row.description,
      row.envelope_id
    );
    transaction.id = row.id;

    res.status(200).json(transaction);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error fetching transaction");
  }
};

export const deleteTransaction: RequestHandler<{ id: string }> = async (
  req,
  res
) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const transactionResponse = await client.query(
      "SELECT * FROM transactions WHERE id = $1",
      [req.validatedTransactionIndex]
    );

    if (transactionResponse.rowCount === 0) {
      await client.query("ROLLBACK");
      res.status(404).json({ message: `Transaction not found!` });
      return;
    }

    const transactionData = transactionResponse.rows[0];
    const transaction = new Transaction(
      transactionData.date,
      parseFloat(transactionData.amount),
      transactionData.description,
      transactionData.envelope_id
    );
    transaction.id = transactionData.id;

    await client.query(
      "UPDATE envelopes SET balance = balance + $1 WHERE id = $2",
      [transaction.amount, transaction.envelopeId]
    );

    const deleteResponse = await client.query(
      "DELETE FROM transactions WHERE id = $1",
      [req.validatedTransactionIndex]
    );

    await client.query("COMMIT");

    if (deleteResponse.rowCount === 1) {
      res.status(200).json({
        message: `Deleted transaction and updated envelope balance.`,
        transaction: {
          id: transaction.id,
          date: transaction.date,
          amount: transaction.amount,
          description: transaction.description,
          envelopeId: transaction.envelopeId,
        },
        deletedRows: deleteResponse.rowCount,
      });
    } else {
      res.status(200).json({
        message: `Deleted ${deleteResponse.rowCount} transactions and updated envelope balances.`,
        deletedRows: deleteResponse.rowCount,
      });
    }
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error deleting transaction:", error);
    res.status(500).send("Error deleting transaction");
  } finally {
    client.release();
  }
};

export const updateTransaction: RequestHandler<{ id: string }> = async (
  req,
  res
) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const parsedBody: {
      description?: string;
      amount?: number;
      date?: string;
      envelope_id?: number;
    } = req.body;

    if (
      (!parsedBody.description || parsedBody.description.trim() === "") &&
      !parsedBody.amount &&
      !parsedBody.date &&
      !parsedBody.envelope_id
    ) {
      await client.query("ROLLBACK");
      res.status(400).json({
        message:
          "You need to send a 'description' (string) or 'amount' (number) or 'date' (string) property in the request body to update transaction!",
      });
      return;
    }

    const foundTransactionResponse = await client.query(
      "SELECT * FROM transactions WHERE id = $1",
      [req.validatedTransactionIndex]
    );

    if (foundTransactionResponse.rowCount === 0) {
      await client.query("ROLLBACK");
      res.status(404).json({
        message: `Transaction ID ${req.validatedTransactionIndex} not found!`,
      });
      return;
    }

    const transactionData = foundTransactionResponse.rows[0];
    const currentTransaction = new Transaction(
      transactionData.date,
      parseFloat(transactionData.amount),
      transactionData.description,
      transactionData.envelope_id
    );
    currentTransaction.id = transactionData.id;

    if (parsedBody.description) {
      await client.query(
        `UPDATE transactions SET description = $1 WHERE id = $2`,
        [parsedBody.description, req.validatedTransactionIndex]
      );
    }

    // TODO: use utility function to verify and transform date accurately
    if (parsedBody.date) {
      await client.query(`UPDATE transactions SET date = $1 WHERE id = $2`, [
        parsedBody.date,
        req.validatedTransactionIndex,
      ]);
    }

    if (parsedBody.amount !== undefined) {
      const currentEnvelope = await client.query(
        "SELECT * FROM envelopes WHERE id = $1",
        [currentTransaction.envelopeId]
      );

      const envelopeBalance = parseFloat(currentEnvelope.rows[0].balance);
      const oldAmount = currentTransaction.amount;
      const newAmount = parsedBody.amount;

      const newBalance = envelopeBalance + oldAmount - newAmount;

      if (newBalance < 0) {
        await client.query("ROLLBACK");
        res.status(403).json({
          message: `Cannot change amount, because envelope balance will be negative!`,
          envelope: currentEnvelope.rows[0],
          currentBalance: envelopeBalance,
          requestedChange: `${oldAmount} → ${newAmount}`,
          resultingBalance: newBalance,
        });
        return;
      }

      await client.query(`UPDATE transactions SET amount = $1 WHERE id = $2`, [
        newAmount,
        req.validatedTransactionIndex,
      ]);

      await client.query(`UPDATE envelopes SET balance = $1 WHERE id = $2`, [
        newBalance,
        currentTransaction.envelopeId,
      ]);
    }

    await client.query("COMMIT");

    const updatedTransactionResponse = await pool.query(
      "SELECT * FROM transactions WHERE id = $1",
      [req.validatedTransactionIndex]
    );

    const updatedRow = updatedTransactionResponse.rows[0];
    const updatedTransaction = new Transaction(
      updatedRow.date,
      parseFloat(updatedRow.amount),
      updatedRow.description,
      updatedRow.envelope_id
    );
    updatedTransaction.id = updatedRow.id;

    res.status(200).json({
      message: `Transaction ID ${req.validatedTransactionIndex} updated!`,
      transaction: updatedTransaction,
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error updating transaction:", error);
    res.status(500).send("Error updating transaction");
  } finally {
    client.release();
  }
};

// TODO: also be able to update envelope ID (if wrong envelope was used) -> need to changes balances of those two envelopes in that case!
