import express from "express";
import Book from "../models/Book.js";
import BookCategory from "../models/BookCategory.js";
import { authMiddleware, adminMiddleware } from "../middleware/auth.js";
import { validateBook } from "../middleware/validation.js";
import { successResponse, errorResponse } from "../utils/response.js";

const router = express.Router();

router.get("/allbooks", authMiddleware, async (req, res) => {
  try {
    const books = await Book.find({}).populate("transactions").sort({ _id: -1 });
    successResponse(res, books, "Books fetched successfully");
  } catch (err) {
    errorResponse(res, err.message, 500);
  }
});

router.get("/getbook/:id", authMiddleware, async (req, res) => {
  try {
    const book = await Book.findById(req.params.id).populate("transactions");
    if (!book) return errorResponse(res, "Book nahi mila", 404);
    successResponse(res, book, "Book fetched successfully");
  } catch (err) {
    errorResponse(res, err.message, 500);
  }
});

router.get("/", authMiddleware, async (req, res) => {
  const category = req.query.category;
  try {
    const books = await BookCategory.findOne({ categoryName: category }).populate("books");
    if (!books) return errorResponse(res, "Category nahi mili", 404);
    successResponse(res, books, "Books by category fetched successfully");
  } catch (err) {
    errorResponse(res, err.message, 500);
  }
});

router.post("/addbook", authMiddleware, adminMiddleware, validateBook, async (req, res) => {
  try {
    const newbook = new Book(req.body);
    const book = await newbook.save();
    await BookCategory.updateMany({ _id: book.categories }, { $push: { books: book._id } });
    successResponse(res, book, "Book added successfully");
  } catch (err) {
    errorResponse(res, err.message, 500);
  }
});

router.put("/updatebook/:id", authMiddleware, adminMiddleware, validateBook, async (req, res) => {
  try {
    const book = await Book.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
    if (!book) return errorResponse(res, "Book nahi mila", 404);
    successResponse(res, book, "Book updated successfully");
  } catch (err) {
    errorResponse(res, err.message, 500);
  }
});

router.delete("/removebook/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return errorResponse(res, "Book nahi mila", 404);
    await book.remove();
    await BookCategory.updateMany({ _id: book.categories }, { $pull: { books: book._id } });
    successResponse(res, null, "Book deleted successfully");
  } catch (err) {
    errorResponse(res, err.message, 500);
  }
});

export default router;