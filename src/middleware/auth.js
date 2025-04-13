const jwt = require('jsonwebtoken');

/**
 * Authentication middleware to check for a valid JWT token in the request headers.
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @param {Function} next - The next middleware function
 * @returns {Object} The decoded user information or a 401 status code if the token is invalid
 */
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Expected format: "Bearer <token>"
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Missing or invalid auth token' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach user info to request
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

module.exports = authMiddleware;