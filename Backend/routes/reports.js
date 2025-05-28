import express from "express";
import BookTransaction from "../models/BookTransaction.js";
import { authMiddleware, adminMiddleware } from "../middleware/auth.js";
import { successResponse, errorResponse } from "../utils/response.js";
import { TRANSACTION_STATUSES } from "../utils/constants.js";

const router = express.Router();

router.get("/overdue", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const transactions = await BookTransaction.find({
      transactionStatus: TRANSACTION_STATUSES.ACTIVE,
      toDate: { $lt: new Date() },
    }).populate("bookId borrowerId");
    transactions.forEach((t) => {
      t.transactionStatus = TRANSACTION_STATUSES.OVERDUE;
      t.save();
    });
    successResponse(res, transactions, "Overdue transactions fetched successfully");
  } catch (err) {
    errorResponse(res, err.message, 500);
  }
});

export default router;