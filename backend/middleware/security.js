/**
 * Express Middleware: Security & Audit Logging Engine
 */
const mockData = require("../data/mockData");

function securityLogger(req, res, next) {
  // Set security headers
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");

  // Log mutating API actions
  if (req.method === "POST" || req.method === "PATCH" || req.method === "DELETE") {
    const logEntry = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      userRole: req.headers["x-user-role"] || "CLIENT_API",
      action: `${req.method}_${req.path.replace(/\//g, '_').toUpperCase()}`,
      details: `Request to ${req.originalUrl} - IP: ${req.ip || '127.0.0.1'}`,
      status: "SUCCESS"
    };
    mockData.auditLogs.unshift(logEntry);
  }

  next();
}

module.exports = securityLogger;
