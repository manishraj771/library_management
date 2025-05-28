export const errorHandler = (err, req, res, next) => {
    console.error(err.stack);
    if (err.name === "ValidationError") {
      return res.status(400).json({ error: "Invalid input: " + err.message });
    }
    if (err.name === "MongoServerError" && err.code === 11000) {
      return res.status(400).json({ error: "Duplicate entry bhai, kuch unique daal" });
    }
    res.status(500).json({ error: "Kuch toh gadbad hai bhai, baad mein try kar" });
  };