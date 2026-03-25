// Fallback middleware for when a route is not found
export const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error); // Pass the error to the custom error handler
};

// Custom error handler middleware
export const errorHandler = (err, req, res, next) => {
  // If the status code is still 200 but an error occurred, set to 500 (Server Error)
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  
  // Format the error response cleanly
  res.json({
    message: err.message,
    // Only show the stack trace if we are not in production (good for debugging during hackathon)
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};
