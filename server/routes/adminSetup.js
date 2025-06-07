const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// Create admin user - TEMPORARY ROUTE FOR SETUP ONLY
router.post('/create-admin', async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    // Validate required fields
    if (!name?.firstName || !name?.lastName || !email || !password || !role) {
      return res.status(400).json({ 
        success: false,
        msg: 'Please provide all required fields',
        missing: {
          firstName: !name?.firstName,
          lastName: !name?.lastName,
          email: !email,
          password: !password,
          role: !role
        }
      });
    }

    // Validate role
    if (!['admin', 'super_admin'].includes(role)) {
      return res.status(400).json({ 
        success: false,
        msg: 'Invalid role. Must be admin or super_admin' 
      });
    }

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ 
        success: false,
        msg: 'User already exists with this email' 
      });
    }

    // Check if this is the first admin being created
    const existingAdmins = await User.countDocuments({ 
      role: { $in: ['admin', 'super_admin'] } 
    });

    // Create new admin user
    user = new User({
      name,
      email,
      password,
      role,
      isEmailVerified: true, // Auto-verify admin accounts
      isActive: true
    });

    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.json({
      success: true,
      msg: `${role.replace('_', ' ')} account created successfully`,
      data: {
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        token,
        isEmailVerified: user.isEmailVerified
      }
    });

  } catch (err) {
    console.error('Admin creation error:', err);
    res.status(500).json({
      success: false,
      msg: 'Server Error',
      error: err.message
    });
  }
});

// Check if any admins exist - for frontend to know if setup is needed
router.get('/check-admins', async (req, res) => {
  try {
    const adminCount = await User.countDocuments({ 
      role: { $in: ['admin', 'super_admin'] } 
    });
    
    const superAdminCount = await User.countDocuments({ 
      role: 'super_admin' 
    });

    res.json({
      success: true,
      data: {
        hasAdmins: adminCount > 0,
        hasSuperAdmin: superAdminCount > 0,
        totalAdmins: adminCount,
        superAdmins: superAdminCount
      }
    });
  } catch (err) {
    console.error('Error checking admins:', err);
    res.status(500).json({
      success: false,
      msg: 'Server Error',
      error: err.message
    });
  }
});

module.exports = router; 