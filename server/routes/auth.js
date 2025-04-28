const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');
const authController = require('../controllers/authController');
const oauthController = require('../controllers/oauthController');

// Import sendEmail function from authController
const { sendEmail } = require('../controllers/authController');

// Test email route
router.get('/test-email', async (req, res) => {
  try {
    // Use test email or admin email from env
    const testEmail = process.env.TEST_EMAIL || process.env.SMTP_USER;
    
    if (!testEmail) {
      return res.status(400).json({ message: 'Test email address not configured' });
    }
    
    const emailResult = await sendEmail(
      testEmail,
      'CycloFit Email Test',
      `
        <h1>Email Test Successful!</h1>
        <p>If you're reading this, your email configuration is working correctly.</p>
        <p>Server Time: ${new Date().toLocaleString()}</p>
      `
    );

    if (emailResult.success) {
      res.json({ 
        message: 'Test email sent successfully',
        dev: emailResult.dev || false
      });
    } else {
      throw new Error(emailResult.error || 'Failed to send test email');
    }
  } catch (error) {
    console.error('Email test error:', error);
    res.status(500).json({ 
      message: 'Error sending test email',
      error: error.message 
    });
  }
});

// Register route
router.post('/register', authController.register);

// Verify email route
router.get('/verify-email', authController.verifyEmail);

// Resend verification email
router.post('/resend-verification', authController.resendVerification);

// Manual verification (admin/testing only)
router.get('/manual-verify/:email', authController.manualVerify);

// Login route
router.post('/login', authController.login);

// Forgot password route
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    console.log('Password reset requested for email:', email);
    const user = await User.findOne({ email });

    if (!user) {
      console.log('User not found for password reset:', email);
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate password reset token
    const resetToken = user.generatePasswordResetToken();
    await user.save();
    
    console.log('Password reset token generated for user:', user.email);

    // Send password reset email
    const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;
    console.log('Password reset URL:', resetUrl);
    
    const emailResult = await sendEmail(
      user.email,
      'Password Reset',
      `
        <h1>Password Reset Request</h1>
        <p>Click the link below to reset your password:</p>
        <a href="${resetUrl}" style="display: inline-block; background-color: #4a90e2; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a>
        <p>This link will expire in 1 hour.</p>
        <p>If the button doesn't work, copy and paste this URL into your browser:</p>
        <p>${resetUrl}</p>
      `
    );

    if (emailResult.success) {
      console.log('Password reset email sent successfully to:', user.email);
      res.json({ 
        success: true,
        message: 'Password reset email sent',
        dev: emailResult.dev || false
      });
    } else {
      throw new Error(emailResult.error || 'Failed to send reset email');
    }
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error sending reset email', 
      error: error.message 
    });
  }
});

// Reset password route
router.post('/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;
    
    if (!token || !password) {
      return res.status(400).json({ 
        success: false,
        message: 'Token and password are required' 
      });
    }

    console.log('Attempting password reset with token:', token);
    
    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
      console.log('Invalid or expired reset token:', token);
      return res.status(400).json({ 
        success: false,
        message: 'Invalid or expired reset token' 
      });
    }

    console.log('Password reset token valid for user:', user.email);
    
    // Update password and clear reset token
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    
    console.log('Password reset successful for user:', user.email);

    res.json({ 
      success: true,
      message: 'Password reset successful' 
    });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error resetting password', 
      error: error.message 
    });
  }
});

// Update profile route
router.put('/profile', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update profile fields
    const {
      height,
      weight,
      age,
      gender,
      phoneNumber,
      address,
      ridingExperience
    } = req.body;

    user.height = height;
    user.weight = weight;
    user.age = age;
    user.gender = gender;
    user.phoneNumber = phoneNumber;
    user.address = address;
    user.ridingExperience = ridingExperience;

    await user.save();

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        height: user.height,
        weight: user.weight,
        age: user.age,
        gender: user.gender,
        phoneNumber: user.phoneNumber,
        address: user.address,
        ridingExperience: user.ridingExperience
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating profile', error: error.message });
  }
});

// Google OAuth routes
router.get('/google',
  passport.authenticate('google', { 
    scope: ['profile', 'email'],
    session: false 
  })
);

router.get('/google/callback', 
  passport.authenticate('google', { 
    failureRedirect: '/login', 
    session: false 
  }),
  oauthController.googleCallback
);

// Get current user
router.get('/me', auth, authController.getMe);

// Update user profile
router.put('/update', auth, authController.updateProfile);

module.exports = router; 