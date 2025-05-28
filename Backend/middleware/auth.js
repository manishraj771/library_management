import jwt from "jsonwebtoken";

export const authMiddleware = (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ error: "Token nahi mila, login karo" });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { userId, isAdmin }
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid token bhai" });
  }
};

export const adminMiddleware = (req, res, next) => {
  if (!req.user.isAdmin) return res.status(403).json({ error: "Sirf admin ke liye hai yeh" });
  next();
};