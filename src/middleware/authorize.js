/**
 * Authorization middleware to check if user has required role
 * @param {...string} allowedRoles - Array of roles that are allowed to access the route
 * @returns {function} Express middleware function
 * @middleware
 */
const authorize = (...allowedRoles) => {
    return (req, res, next) => {
        const userRole = req.user.role;
        if (!allowedRoles.includes(userRole)) {
            return res.status(403).json({ message: 'Forbidden: insufficient role' });
        }
        next();
    };
};

module.exports = authorize;