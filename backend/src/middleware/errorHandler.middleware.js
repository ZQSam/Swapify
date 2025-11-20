export const errorHandler = (err, req, res, next) => {
  console.error("ERROR:", err);

  if (err.name === "ZodError") {
    return res.status(400).json({
      error: err.errors?.[0]?.message || "Validation error"
    });
  }

  if (err.name === "CastError") {
    return res.status(400).json({ error: "Invalid ID format" });
  }

  if (err.code === 11000) {
    return res.status(409).json({ error: "Duplicate entry" });
  }

  res.status(500).json({ error: "Internal server error" });
};
