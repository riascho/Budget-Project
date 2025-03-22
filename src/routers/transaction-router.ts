import { Router } from "express";
import {
  getAllTransactions,
  getSingleTransaction,
  setTransactionIndex,
  updateTransaction,
  deleteTransaction,
} from "../controllers/transactions-controller";

export const transactionRouter = Router();

transactionRouter.param("id", setTransactionIndex);
transactionRouter.get("/", getAllTransactions); // READ ALL
transactionRouter.get("/:id", getSingleTransaction); // READ ONE
transactionRouter.put("/:id", updateTransaction); // UPDATE
transactionRouter.delete("/:id", deleteTransaction); // DELETE

// transactionRouter.post("/"); // CREATE -  use makeTransaction endpoint from envelope Router
