import express from "express";
import User from "../models/User.js";
import bcrypt from "bcrypt";
import { authMiddleware, adminMiddleware } from "../middleware/auth.js";
import { validateUser } from "../middleware/validation.js";
import { successResponse, errorResponse } from "../utils/response.js";

const router = express.Router();

router.get("/getuser/:id", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate("activeTransactions prevTransactions");
    if (!user) return errorResponse(res, "User nahi mila", 404);
    const { password, ...other } = user._doc;
    successResponse(res, other, "User fetched successfully");
  } catch (err) {
    errorResponse(res, err.message, 500);
  }
});

router.get("/allmembers", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const users = await User.find({}).populate("activeTransactions prevTransactions").sort({ _id: -1 });
    const sanitizedUsers = users.map((user) => {
      const { password, ...other } = user._doc;
      return other;
    });
    successResponse(res, sanitizedUsers, "Members fetched successfully");
  } catch (err) {
    errorResponse(res, err.message, 500);
  }
});

router.put("/updateuser/:id", authMiddleware, async (req, res) => {
  if (req.user.userId === req.params.id || req.user.isAdmin) {
    try {
      if (req.body.password) {
        const salt = await bcrypt.genSalt(10);
        req.body.password = await bcrypt.hash(req.body.password, salt);
      }
      const user = await User.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
      if (!user) return errorResponse(res, "User nahi mila", 404);
      const { password, ...other } = user._doc;
      successResponse(res, other, "Account updated successfully");
    } catch (err) {
      errorResponse(res, err.message, 500);
    }
  } else {
    errorResponse(res, "Apna account hi update kar sakte ho", 403);
  }
});

router.get("/me/issued", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).populate({
      path: "activeTransactions",
      match: { transactionStatus: "Active" },
      populate: { path: "bookId" },
    });
    successResponse(res, user.activeTransactions, "Issued books fetched successfully");
  } catch (err) {
    errorResponse(res, err.message, 500);
  }
});

router.delete("/deleteuser/:id", authMiddleware, async (req, res) => {
  if (req.user.userId === req.params.id || req.user.isAdmin) {
    try {
      const user = await User.findById(req.params.id);
      if (!user) return errorResponse(res, "User nahi mila", 404);
      if (user.activeTransactions.length > 0)
        return errorResponse(res, "Active transactions hain, pehle return karo", 400);
      await user.remove();
      successResponse(res, null, "Account deleted successfully");
    } catch (err) {
      errorResponse(res, err.message, 500);
    }
  } else {
    errorResponse(res, "Apna account hi delete kar sakte ho", 403);
  }
});

export default router;