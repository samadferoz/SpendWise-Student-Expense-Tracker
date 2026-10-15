/**
 * Centralized Error Handling Middleware for Express.
 * Formats standard HTTP errors and IBM Cloudant NoSQL specific error codes.
 */
export const errorHandler = (err, req, res, next) => {
  console.error(`[Error] ${req.method} ${req.originalUrl}:`, err.message || err);

  // IBM Cloudant specific error handling
  if (err.status || err.code) {
    const statusCode = err.status || err.code;

    // 404 Not Found (Cloudant doc or db missing)
    if (statusCode === 404) {
      return res.status(404).json({
        success: false,
        message: 'The requested resource or transaction was not found in Cloudant.',
        error: err.message || 'Document not found'
      });
    }

    // 409 Conflict (Cloudant revision mismatch / MVCC conflict)
    if (statusCode === 409) {
      return res.status(409).json({
        success: false,
        message: 'Cloudant update conflict (_rev mismatch). The document was modified by another process. Please refresh and try again.',
        error: err.message || 'Document update conflict'
      });
    }

    // 401 Unauthorized / 403 Forbidden
    if (statusCode === 401 || statusCode === 403) {
      return res.status(statusCode).json({
        success: false,
        message: 'IBM Cloudant authentication failed. Please verify CLOUDANT_APIKEY and CLOUDANT_URL.',
        error: err.message || 'Unauthorized Cloudant access'
      });
    }
  }

  // Handle configuration errors
  if (err.code === 'CLOUDANT_NOT_CONFIGURED') {
    return res.status(503).json({
      success: false,
      message: 'IBM Cloudant database is not configured. Please supply valid credentials in the backend environment.',
      error: err.message
    });
  }

  // Generic 500 internal server error
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'production' ? 'An unexpected error occurred' : err.stack
  });
};
