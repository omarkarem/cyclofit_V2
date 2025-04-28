const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');

// Email transporter setup
let transporter;
try {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
} catch (error) {
  console.error('Error setting up email transporter:', error);
}

// Helper function to send emails, with fallback to console in development
const sendEmail = async (to, subject, html) => {
  // Skip actual email sending if we're in development and email isn't configured
  if (process.env.NODE_ENV === 'development' && (!process.env.SMTP_USER || !process.env.SMTP_PASS)) {
    console.log('\n-------- Email would have been sent --------');
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log('HTML Content:', html);
    console.log('-------- End of email content --------\n');
    return { success: true, dev: true };
  }

  try {
    if (!transporter) {
      throw new Error('Email transporter not initialized');
    }
    
    const info = await transporter.sendMail({
      from: process.env.SMTP_USER || 'noreply@cyclofit.com',
      to,
      subject,
      html
    });
    return { success: true, info };
  } catch (error) {
    console.error('Error sending email:', error);
    // If we're in development, still log the email content even if sending fails
    if (process.env.NODE_ENV === 'development') {
      console.log('\n-------- Email failed to send, content would have been --------');
      console.log(`To: ${to}`);
      console.log(`Subject: ${subject}`);
      console.log('HTML Content:', html);
      console.log('-------- End of email content --------\n');
      return { success: false, dev: true, error };
    }
    return { success: false, error };
  }
};

// Export the sendEmail function to be used in other files
exports.sendEmail = sendEmail;

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// Register user
exports.register = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Log incoming request data
    console.log('Registration attempt:', { 
      name: name ? { 
        firstName: name.firstName, 
        lastName: name.lastName 
      } : undefined,
      email, 
      password: password ? '***' : 'undefined' 
    });

    // Validate required fields
    if (!name?.firstName || !name?.lastName || !email || !password) {
      console.log('Missing required fields:', { 
        name: name ? { 
          firstName: name.firstName, 
          lastName: name.lastName 
        } : undefined,
        email, 
        password: password ? '***' : 'undefined' 
      });
      return res.status(400).json({ 
        msg: 'Please provide all required fields',
        missing: {
          firstName: !name?.firstName,
          lastName: !name?.lastName,
          email: !email,
          password: !password
        }
      });
    }

    // Check if user exists
    let user = await User.findOne({ email });
    if (user) {
      console.log('User already exists:', email);
      return res.status(400).json({ msg: 'User already exists' });
    }

    // Create new user
    user = new User({
      name,
      email,
      password,
    });

    // Generate email verification token
    const verificationToken = user.generateEmailVerificationToken();
    await user.save();
    
    // Important! Store the new token in the database
    console.log('Generated verification token:', verificationToken);
    console.log('User saved with verification token:', user.emailVerificationToken);

    // Send verification email
    const verificationUrl = `${process.env.CLIENT_URL}/verify-email?token=${verificationToken}`;
    console.log('Verification URL:', verificationUrl);
    
    const emailTemplate = `
      <h1>Welcome to CycloFit!</h1>
      <p>Please verify your email by clicking the link below:</p>
      <a href="${verificationUrl}" style="display: inline-block; background-color: #4a90e2; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Verify Email</a>
      <p>This link will expire in 24 hours.</p>
      <p>If the button doesn't work, copy and paste this URL into your browser:</p>
      <p>${verificationUrl}</p>
    `;
    
    const emailResult = await sendEmail(user.email, 'Verify your CycloFit account', emailTemplate);

    // Generate JWT token
    const token = generateToken(user._id);

    // Return success even if email fails in development
    res.status(201).json({
      _id: user.id,
      name: user.name,
      email: user.email,
      token,
      message: emailResult.success 
        ? 'Registration successful! Please check your email to verify your account.' 
        : 'Registration successful! Email verification could not be sent. Please contact support.',
      dev: emailResult.dev || false
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ 
      msg: 'Server Error',
      error: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
};

// Verify email
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;
    
    if (!token) {
      return res.status(400).json({ msg: 'Verification token is missing' });
    }
    
    console.log('Verifying token:', token);
    
    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: Date.now() }
    });

    if (!user) {
      console.log('User not found with token:', token);
      return res.status(400).json({ msg: 'Invalid or expired verification token' });
    }

    console.log('User found, verifying email for:', user.email);
    
    // Update user
    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();
    
    console.log('Email verified successfully for:', user.email);

    // If it's an API request, return JSON
    if (req.headers.accept && req.headers.accept.includes('application/json')) {
      return res.json({ 
        success: true, 
        msg: 'Email verified successfully',
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          isEmailVerified: user.isEmailVerified
        }
      });
    }
    
    // For browser redirects
    res.redirect(`${process.env.CLIENT_URL}/login?verified=true`);
  } catch (err) {
    console.error('Email verification error:', err);
    
    // If it's an API request, return JSON
    if (req.headers.accept && req.headers.accept.includes('application/json')) {
      return res.status(500).json({ 
        msg: 'Server Error',
        error: err.message 
      });
    }
    
    // For browser redirects
    res.redirect(`${process.env.CLIENT_URL}/login?error=verification_failed`);
  }
};

// Login user
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check for user email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // Check if email is verified - no bypassing verification anymore
    if (!user.isEmailVerified) {
      // Return a specific error code so frontend can handle it specially
      return res.status(403).json({ 
        msg: 'Please verify your email before logging in', 
        needsVerification: true,
        email: user.email 
      });
    }

    // Generate token
    const token = generateToken(user._id);

    res.json({
      _id: user.id,
      name: user.name,
      email: user.email,
      token,
      isEmailVerified: user.isEmailVerified,
      height: user.height,
      weight: user.weight,
      bikeType: user.bikeType,
      experience: user.experience
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({
      msg: 'Server Error',
      error: err.message
    });
  }
};

// Get current user
exports.getMe = async (req, res) => {
  try {
    console.log('getMe endpoint accessed', { 
      userId: req.user._id, 
      path: '/api/auth/me'
    });
    
    const user = await User.findById(req.user._id).select('-password');
    
    if (!user) {
      console.log('User not found in getMe', { userId: req.user._id });
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('User found in getMe', { userId: user._id, email: user.email });
    
    res.json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        profilePicture: user.profilePicture,
        isEmailVerified: user.isEmailVerified,
        height: user.height,
        weight: user.weight,
        bikeType: user.bikeType,
        experience: user.experience,
        bio: user.bio
      }
    });
  } catch (err) {
    console.error('Error retrieving user profile:', err);
    res.status(500).json({ 
      success: false,
      message: 'Server Error', 
      error: err.message 
    });
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    console.log('updateProfile endpoint accessed', { 
      userId: req.user._id,
      path: '/api/auth/update',
      body: req.body
    });
    
    const user = await User.findById(req.user._id);
    
    if (!user) {
      console.log('User not found in updateProfile', { userId: req.user._id });
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('User found in updateProfile', { userId: user._id, email: user.email });
    
    // Fields that can be updated
    const { name, height, weight, bikeType, experience, bio } = req.body;

    // Update fields if provided
    if (name) {
      if (name.firstName) user.name.firstName = name.firstName;
      if (name.lastName) user.name.lastName = name.lastName;
    }
    
    // Update profile fields
    if (height !== undefined) user.height = height;
    if (weight !== undefined) user.weight = weight;
    if (bikeType !== undefined) user.bikeType = bikeType;
    if (experience !== undefined) user.experience = experience;
    if (bio !== undefined) user.bio = bio;

    await user.save();
    
    console.log('User profile updated successfully', { userId: user._id, email: user.email });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        profilePicture: user.profilePicture,
        isEmailVerified: user.isEmailVerified,
        height: user.height,
        weight: user.weight,
        bikeType: user.bikeType,
        experience: user.experience,
        bio: user.bio
      }
    });
  } catch (err) {
    console.error('Error updating user profile:', err);
    res.status(500).json({
      success: false,
      message: 'Error updating profile',
      error: err.message
    });
  }
};

// Resend verification email
exports.resendVerification = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ msg: 'Email is required' });
    }

    // Find the user by email
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    if (user.isEmailVerified) {
      return res.status(400).json({ msg: 'Email is already verified' });
    }

    // Generate new verification token
    const verificationToken = user.generateEmailVerificationToken();
    await user.save();

    // Send verification email
    const verificationUrl = `${process.env.CLIENT_URL}/verify-email?token=${verificationToken}`;
    const emailTemplate = `
      <h1>Welcome to CycloFit!</h1>
      <p>Please verify your email by clicking the link below:</p>
      <a href="${verificationUrl}" style="display: inline-block; background-color: #4a90e2; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Verify Email</a>
      <p>This link will expire in 24 hours.</p>
      <p>If the button doesn't work, copy and paste this URL into your browser:</p>
      <p>${verificationUrl}</p>
    `;
    
    const emailResult = await sendEmail(user.email, 'Verify your CycloFit account', emailTemplate);

    res.json({
      success: true,
      message: 'Verification email sent successfully',
      dev: emailResult.dev || false
    });
  } catch (err) {
    console.error('Resend verification error:', err);
    res.status(500).json({ 
      msg: 'Server Error',
      error: err.message 
    });
  }
};

// Manual verification by email (for admin/testing purposes)
exports.manualVerify = async (req, res) => {
  try {
    const { email } = req.params;
    
    if (!email) {
      return res.status(400).json({ msg: 'Email is required' });
    }
    
    console.log('Manual verification for email:', email);
    
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    // Update user verification status
    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();
    
    console.log('Email manually verified for:', user.email);
    
    res.json({
      success: true,
      msg: 'Email has been manually verified',
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        isEmailVerified: user.isEmailVerified
      }
    });
  } catch (err) {
    console.error('Manual verification error:', err);
    res.status(500).json({ 
      msg: 'Server Error',
      error: err.message
    });
  }
}; 