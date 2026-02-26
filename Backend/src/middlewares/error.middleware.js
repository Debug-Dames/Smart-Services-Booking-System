const errorHandler = (err, _req, res, _next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal server error";

  return res.status(statusCode).json({
    message,
    details: err.details || null,
  });
};

module.exports = {
  errorHandler,
};
