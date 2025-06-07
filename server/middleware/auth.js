const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Basic authentication middleware
const auth = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from the token
    // The token contains { id: user._id } so we need to use decoded.id
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.status(401).json({ msg: 'Token is not valid or user not found' });
    }

    if (!user.isActive) {
      return res.status(401).json({ msg: 'Account has been deactivated' });
    }

    // Update last login
    user.lastLoginAt = new Date();
    await user.save();

    // Store the user object in req for use in route handlers
    req.user = user;
    next();
  } catch (err) {
    console.error('Auth middleware error:', err.message);
    res.status(401).json({ msg: 'Token is not valid' });
  }
};

// Admin only middleware
const adminAuth = async (req, res, next) => {
  try {
    // First run basic auth
    await auth(req, res, () => {
      // Check if user is admin or super_admin
      if (!req.user || !['admin', 'super_admin'].includes(req.user.role)) {
        return res.status(403).json({ 
          msg: 'Access denied. Admin privileges required.' 
        });
      }
      next();
    });
  } catch (err) {
    console.error('Admin auth middleware error:', err.message);
    res.status(401).json({ msg: 'Token is not valid' });
  }
};

// Super admin only middleware
const superAdminAuth = async (req, res, next) => {
  try {
    // First run basic auth
    await auth(req, res, () => {
      // Check if user is super_admin
      if (!req.user || req.user.role !== 'super_admin') {
        return res.status(403).json({ 
          msg: 'Access denied. Super admin privileges required.' 
        });
      }
      next();
    });
  } catch (err) {
    console.error('Super admin auth middleware error:', err.message);
    res.status(401).json({ msg: 'Token is not valid' });
  }
};

module.exports = auth;
module.exports.auth = auth;
module.exports.adminAuth = adminAuth;
module.exports.superAdminAuth = superAdminAuth; 