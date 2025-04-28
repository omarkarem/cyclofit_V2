const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const userController = require('../controllers/userController');

// Get current user profile
router.get('/me', auth, userController.getCurrentUser);
router.get('/profile', auth, userController.getCurrentUser);

// Update user profile
router.put('/me', auth, userController.updateProfile);
router.put('/profile', auth, userController.updateProfile);

module.exports = router; 