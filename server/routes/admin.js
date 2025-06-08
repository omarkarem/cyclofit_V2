const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { adminAuth, superAdminAuth } = require('../middleware/auth');

// Dashboard Analytics
router.get('/dashboard/stats', adminAuth, adminController.getDashboardStats);

// User Management
router.get('/users', adminAuth, adminController.getAllUsers);
router.patch('/users/:userId/status', adminAuth, adminController.toggleUserStatus);
router.patch('/users/:userId/role', adminAuth, adminController.updateUserRole);

// Analysis Management
router.get('/analyses', adminAuth, adminController.getAllAnalyses);
router.get('/analyses/:analysisId', adminAuth, adminController.getAnalysisById);
router.get('/analyses/:analysisId/processed-video', adminAuth, adminController.getProcessedVideo);
router.get('/analyses/:analysisId/original-video', adminAuth, adminController.getOriginalVideo);
router.get('/analyses/:analysisId/keyframes', adminAuth, adminController.getKeyframes);
router.delete('/analyses/:analysisId', adminAuth, adminController.deleteAnalysis);

// Contact Form Management
router.get('/contacts', adminAuth, adminController.getAllContacts);
router.patch('/contacts/:contactId/status', adminAuth, adminController.updateContactStatus);

// Newsletter Management
router.get('/subscribers', adminAuth, adminController.getAllSubscribers);

// System Health
router.get('/system/health', adminAuth, adminController.getSystemHealth);

module.exports = router; 