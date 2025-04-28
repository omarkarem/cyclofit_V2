const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// Handle Google OAuth callback
exports.googleCallback = async (req, res) => {
  try {
    // Passport.js attaches the user to req.user
    const user = req.user;
    
    if (!user) {
      return res.redirect(`${process.env.CLIENT_URL}/login?error=Authentication failed`);
    }
    
    // Generate JWT token
    const token = generateToken(user._id);
    
    // Redirect to client with token
    res.redirect(`${process.env.CLIENT_URL}/oauth-callback?token=${token}`);
  } catch (err) {
    console.error('Google callback error:', err);
    res.redirect(`${process.env.CLIENT_URL}/login?error=Server error`);
  }
}; 