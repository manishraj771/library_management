import mongoose from "mongoose";
import { BOOK_STATUSES } from "../utils/constants.js";

const BookSchema = new mongoose.Schema(
  {
    bookName: {
      type: String,
      required: true,
    },
    alternateTitle: {
      type: String,
      default: "",
    },
    author: {
      type: String,
      required: true,
    },
    language: {
      type: String,
      default: "",
    },
    publisher: {
      type: String,
      default: "",
    },
    bookCountAvailable: {
      type: Number,
      required: true,
      min: 0,
    },
    totalCopies: {
      type: Number,
      required: true,
      min: 0,
    },
    bookStatus: {
      type: String,
      enum: Object.values(BOOK_STATUSES),
      default: BOOK_STATUSES.AVAILABLE,
    },
    categories: [
      {
        type: mongoose.Types.ObjectId,
        ref: "BookCategory",
        required: true,
      },
    ],
    transactions: [
      {
        type: mongoose.Types.ObjectId,
        ref: "BookTransaction",
      },
    ],
  },
  {
    timestamps: true,
  }
);

BookSchema.index({ bookName: 1, author: 1 }, { unique: true });

export default mongoose.model("Book", BookSchema);