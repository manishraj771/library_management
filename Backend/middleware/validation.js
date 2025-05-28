import { TRANSACTION_TYPES, USER_TYPES } from "../utils/constants.js";

export const validateBook = (req, res, next) => {
  const { bookName, author, bookCountAvailable, totalCopies, categories } = req.body;
  if (!bookName || !author || bookCountAvailable == null || totalCopies == null || !categories) {
    return res.status(400).json({ error: "Saare fields chahiye bhai" });
  }
  if (bookCountAvailable < 0 || totalCopies < 0 || bookCountAvailable > totalCopies) {
    return res.status(400).json({ error: "Invalid book counts" });
  }
  if (!Array.isArray(categories) || categories.length === 0) {
    return res.status(400).json({ error: "Categories array chahiye" });
  }
  next();
};

export const validateTransaction = (req, res, next) => {
  const { bookId, borrowerId, transactionType, fromDate, toDate } = req.body;
  if (!bookId || !borrowerId || !transactionType || !fromDate || !toDate) {
    return res.status(400).json({ error: "Saare fields bharo bhai" });
  }
  if (!Object.values(TRANSACTION_TYPES).includes(transactionType)) {
    return res.status(400).json({ error: "Transaction type ya toh Issue ya Reservation hona chahiye" });
  }
  next();
};

export const validateUser = (req, res, next) => {
  const { userType, userFullName, email, mobileNumber, password } = req.body;
  if (!userType || !userFullName || !email || !mobileNumber || !password) {
    return res.status(400).json({ error: "Saare required fields bharo" });
  }
  if (!Object.values(USER_TYPES).includes(userType)) {
    return res.status(400).json({ error: "User type Student ya Employee hona chahiye" });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: "Password kam se kam 6 characters ka hona chahiye" });
  }
  if (!/^\d{10}$/.test(mobileNumber)) {
    return res.status(400).json({ error: "Mobile number 10 digits ka hona chahiye" });
  }
  next();
};

export const validateCategory = (req, res, next) => {
  const { categoryName } = req.body;
  if (!categoryName) {
    return res.status(400).json({ error: "Category name chahiye bhai" });
  }
  next();
};