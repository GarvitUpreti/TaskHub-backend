/**
 * Centralized Error Handler
 * Catches any errors from controllers or middleware
 * Returns clean JSON response
 */
const errorHandler = (err, req, res, next) => {
  console.error(err); // Logs the error for debugging

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    message,
    // Optional: include stack trace in dev
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = errorHandler;
