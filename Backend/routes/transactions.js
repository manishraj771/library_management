import express from "express";
import Book from "../models/Book.js";
import BookTransaction from "../models/BookTransaction.js";
import User from "../models/User.js";
import { authMiddleware, adminMiddleware } from "../middleware/auth.js";
import { validateTransaction } from "../middleware/validation.js";
import { successResponse, errorResponse } from "../utils/response.js";
import { parseDate, isDateOverdue } from "../utils/date.js";
import { TRANSACTION_STATUSES } from "../utils/constants.js";

const router = express.Router();

router.post("/add-transaction", authMiddleware, adminMiddleware, validateTransaction, async (req, res) => {
  try {
    const { bookId, borrowerId, fromDate, toDate } = req.body;
    parseDate(fromDate);
    parseDate(toDate);
    const book = await Book.findById(bookId);
    if (!book) return errorResponse(res, "Book nahi mila", 404);
    if (book.bookCountAvailable < 1) return errorResponse(res, "Book available nahi hai", 400);
    const user = await User.findById(borrowerId);
    if (!user) return errorResponse(res, "User nahi mila", 404);
    const newtransaction = new BookTransaction({
      ...req.body,
      fromDate: parseDate(fromDate),
      toDate: parseDate(toDate),
      transactionStatus: isDateOverdue(parseDate(toDate)) ? TRANSACTION_STATUSES.OVERDUE : TRANSACTION_STATUSES.ACTIVE,
    });
    const transaction = await newtransaction.save();
    book.bookCountAvailable -= 1;
    book.bookStatus = book.bookCountAvailable === 0 ? "Unavailable" : "Available";
    await book.updateOne({ $push: { transactions: transaction._id } });
    await book.save();
    await user.updateOne({ $push: { activeTransactions: transaction._id } });
    successResponse(res, transaction, "Transaction added successfully");
  } catch (err) {
    errorResponse(res, err.message, 500);
  }
});

router.get("/all-transactions", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const transactions = await BookTransaction.find({}).populate("bookId borrowerId").sort({ _id: -1 });
    successResponse(res, transactions, "Transactions fetched successfully");
  } catch (err) {
    errorResponse(res, err.message, 500);
  }
});

router.put("/update-transaction/:id", authMiddleware, adminMiddleware, validateTransaction, async (req, res) => {
  try {
    const transaction = await BookTransaction.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    if (!transaction) return errorResponse(res, "Transaction nahi mila", 404);
    successResponse(res, transaction, "Transaction updated successfully");
  } catch (err) {
    errorResponse(res, err.message, 500);
  }
});

router.delete("/remove-transaction/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const transaction = await BookTransaction.findById(req.params.id);
    if (!transaction) return errorResponse(res, "Transaction nahi mila", 404);
    const book = await Book.findById(transaction.bookId);
    await book.updateOne({ $pull: { transactions: req.params.id } });
    const user = await User.findById(transaction.borrowerId);
    await user.updateOne({
      $pull: {
        activeTransactions: req.params.id,
        prevTransactions: req.params.id,
      },
    });
    await transaction.remove();
    successResponse(res, null, "Transaction deleted successfully");
  } catch (err) {
    errorResponse(res, err.message, 500);
  }
});

router.post("/return/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const transaction = await BookTransaction.findById(req.params.id);
    if (!transaction) return errorResponse(res, "Transaction nahi mila", 404);
    if (transaction.transactionStatus === TRANSACTION_STATUSES.RETURNED)
      return errorResponse(res, "Book already returned", 400);
    transaction.transactionStatus = TRANSACTION_STATUSES.RETURNED;
    transaction.returnDate = new Date();
    await transaction.save();
    const book = await Book.findById(transaction.bookId);
    book.bookCountAvailable += 1;
    book.bookStatus = "Available";
    await book.save();
    const user = await User.findById(transaction.borrowerId);
    await user.updateOne({
      $pull: { activeTransactions: transaction._id },
      $push: { prevTransactions: transaction._id },
    });
    successResponse(res, transaction, "Book returned successfully");
  } catch (err) {
    errorResponse(res, err.message, 500);
  }
});

export default router;