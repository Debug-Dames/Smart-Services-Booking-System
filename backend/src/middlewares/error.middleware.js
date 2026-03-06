export function notFoundHandler(req, res, next) {
  res.status(404).json({
    message: "Route not found",
    method: req.method,
    path: req.originalUrl,
  });
}

export function errorHandler(err, req, res, next) {
  console.error(err);
  res.status(500).json({ message: "Internal server error" });
}
