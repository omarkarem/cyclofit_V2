const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async (req, res, next) => {
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

    // Store the user object in req for use in route handlers
    req.user = user;
    next();
  } catch (err) {
    console.error('Auth middleware error:', err.message);
    res.status(401).json({ msg: 'Token is not valid' });
  }
}; 