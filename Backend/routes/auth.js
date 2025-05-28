import express from "express";
import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { validateUser } from "../middleware/validation.js";
import { successResponse, errorResponse } from "../utils/response.js";

const router = express.Router();

router.post("/register", validateUser, async (req, res) => {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPass = await bcrypt.hash(req.body.password, salt);
    const newuser = new User({
      ...req.body,
      password: hashedPass,
      isAdmin: false, // Restrict admin role
    });
    const user = await newuser.save();
    const token = jwt.sign({ userId: user._id, isAdmin: user.isAdmin }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    const { password, ...other } = user._doc;
    successResponse(res, { token, user: other }, "User registered successfully");
  } catch (err) {
    errorResponse(res, err.message, 500);
  }
});

router.post("/signin", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return errorResponse(res, "User nahi mila", 404);
    const validPass = await bcrypt.compare(req.body.password, user.password);
    if (!validPass) return errorResponse(res, "Galat password", 400);
    const token = jwt.sign({ userId: user._id, isAdmin: user.isAdmin }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    const { password, ...other } = user._doc;
    successResponse(res, { token, user: other }, "Login successful");
  } catch (err) {
    errorResponse(res, err.message, 500);
  }
});

export default router;