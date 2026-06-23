

export const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch((err) => next(err));
  };
};

export const errorHandler = (err, req, res, next) => {
 
  if (err.name === "ZodError") {
    const messages = err.issues.map((e) => `${e.path.join(".") || "field"}: ${e.message}`).join(", ");
    return res.status(400).json({ status: "fail", message: messages });
  }

  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({ status: "fail", message: "Invalid token" });
  }
  if (err.name === "TokenExpiredError") {
    return res.status(401).json({ status: "fail", message: "Token has expired" });
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] ?? "field";
    return res.status(409).json({ status: "fail", message: `${field} already exists` });
  }


  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((e) => e.message).join(", ");
    return res.status(400).json({ status: "fail", message: messages });
  }


  if (err.name === "CastError") {
    return res.status(400).json({ status: "fail", message: `Invalid ${err.path}: ${err.value}` });
  }
  
  // Fallback
  res.status(err.status || 500).json({
  status: "error",
  message: err.message ,
  path: req.originalUrl,
  method: req.method,
  stack: err.stack 
});
};

