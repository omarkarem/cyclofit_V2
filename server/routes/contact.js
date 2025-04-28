const express = require('express');
const router = express.Router();
const { submitContactForm, getContactSubmissions, updateContactStatus } = require('../controllers/contactController');

// Import middleware for authentication if needed
// Uncomment and configure these properly with your auth middleware
// const { protect, admin } = require('../middleware/authMiddleware');

// Public route for submitting contact form
router.post('/', submitContactForm);

// Admin routes - adding basic security for now
// These routes should eventually be protected by proper authentication middleware
const checkAdminApiKey = (req, res, next) => {
  // Simple API key check - NOT for production use without further security measures
  const apiKey = req.headers['x-api-key'];
  
  if (!apiKey || apiKey !== process.env.ADMIN_API_KEY) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized - Invalid API key'
    });
  }
  
  next();
};

// For now, these routes are protected by a simple API key
router.get('/', checkAdminApiKey, getContactSubmissions);
router.patch('/:id', checkAdminApiKey, updateContactStatus);

module.exports = router; 