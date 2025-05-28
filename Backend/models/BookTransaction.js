import mongoose from "mongoose";
import { TRANSACTION_TYPES, TRANSACTION_STATUSES } from "../utils/constants.js";

const BookTransactionSchema = new mongoose.Schema(
  {
    bookId: {
      type: mongoose.Types.ObjectId,
      ref: "Book",
      required: true,
    },
    borrowerId: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
    transactionType: {
      type: String,
      required: true,
      enum: Object.values(TRANSACTION_TYPES),
    },
    fromDate: {
      type: Date,
      required: true,
    },
    toDate: {
      type: Date,
      required: true,
    },
    returnDate: {
      type: Date,
    },
    transactionStatus: {
      type: String,
      enum: Object.values(TRANSACTION_STATUSES),
      default: TRANSACTION_STATUSES.ACTIVE,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("BookTransaction", BookTransactionSchema);