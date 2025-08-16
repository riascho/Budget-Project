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
transactionRouter.get("/", getAllTransactions);
transactionRouter.get("/:id", getSingleTransaction);
transactionRouter.put("/:id", updateTransaction);
transactionRouter.delete("/:id", deleteTransaction);
