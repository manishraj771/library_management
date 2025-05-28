import express from "express";
import BookCategory from "../models/BookCategory.js";
import { authMiddleware, adminMiddleware } from "../middleware/auth.js";
import { validateCategory } from "../middleware/validation.js";
import { successResponse, errorResponse } from "../utils/response.js";

const router = express.Router();

router.get("/allcategories", authMiddleware, async (req, res) => {
  try {
    const categories = await BookCategory.find({});
    successResponse(res, categories, "Categories fetched successfully");
  } catch (err) {
    errorResponse(res, err.message, 500);
  }
});

router.post("/addcategory", authMiddleware, adminMiddleware, validateCategory, async (req, res) => {
  try {
    const newcategory = new BookCategory(req.body);
    const category = await newcategory.save();
    successResponse(res, category, "Category added successfully");
  } catch (err) {
    errorResponse(res, err.message, 500);
  }
});

router.put("/updatecategory/:id", authMiddleware, adminMiddleware, validateCategory, async (req, res) => {
  try {
    const category = await BookCategory.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
    if (!category) return errorResponse(res, "Category nahi mili", 404);
    successResponse(res, category, "Category updated successfully");
  } catch (err) {
    errorResponse(res, err.message, 500);
  }
});

router.delete("/removecategory/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const category = await BookCategory.findById(req.params.id);
    if (!category) return errorResponse(res, "Category nahi mili", 404);
    if (category.books.length > 0) return errorResponse(res, "Category mein books hain, pehle unko hatao", 400);
    await category.remove();
    successResponse(res, null, "Category deleted successfully");
  } catch (err) {
    errorResponse(res, err.message, 500);
  }
});

export default router;