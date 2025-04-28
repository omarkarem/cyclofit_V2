const express = require('express');
const router = express.Router();
const { subscribe, unsubscribe, getSubscribers } = require('../controllers/newsletterController');

// Public routes
router.post('/', subscribe);
router.delete('/:email', unsubscribe);

// Admin routes - protected by API key
const checkAdminApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  
  if (!apiKey || apiKey !== process.env.ADMIN_API_KEY) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized - Invalid API key'
    });
  }
  
  next();
};

// Admin route to get all subscribers
router.get('/', checkAdminApiKey, getSubscribers);

module.exports = router; 