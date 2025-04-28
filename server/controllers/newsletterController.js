const Newsletter = require('../models/Newsletter');
const nodemailer = require('nodemailer');

// @desc    Subscribe to newsletter
// @route   POST /api/newsletter
// @access  Public
exports.subscribe = async (req, res) => {
  try {
    const { email, source = 'other' } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    // Check if email already exists
    let subscriber = await Newsletter.findOne({ email });
    
    if (subscriber) {
      // If already subscribed, just return success
      if (subscriber.subscribed) {
        return res.status(200).json({
          success: true,
          message: 'You are already subscribed to our newsletter'
        });
      }
      
      // If previously unsubscribed, resubscribe them
      subscriber.subscribed = true;
      subscriber.unsubscribedAt = null;
      subscriber.subscribedAt = Date.now();
      subscriber.source = source;
      await subscriber.save();
      
      return res.status(200).json({
        success: true,
        message: 'Welcome back! You have been resubscribed to our newsletter'
      });
    }

    // Create new subscriber
    subscriber = await Newsletter.create({
      email,
      source
    });

    // Send welcome email if email configuration exists
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      try {
        const transporter = nodemailer.createTransport({
          service: process.env.EMAIL_SERVICE || 'gmail',
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
          }
        });

        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: email,
          subject: 'Welcome to CycloFit Newsletter',
          html: `
            <h2>Thanks for subscribing to CycloFit Newsletter!</h2>
            <p>You'll be the first to know about new features, cycling tips, and special offers.</p>
            <p>If you ever want to unsubscribe, you can click the unsubscribe link at the bottom of any newsletter.</p>
            <p>Happy cycling!</p>
            <p>The CycloFit Team</p>
          `
        };

        await transporter.sendMail(mailOptions);
      } catch (emailError) {
        console.error('Error sending welcome email:', emailError);
        // Don't fail the request if the email fails
      }
    }

    res.status(201).json({
      success: true,
      data: { email: subscriber.email },
      message: 'Successfully subscribed to the newsletter'
    });
  } catch (error) {
    console.error('Error subscribing to newsletter:', error);
    res.status(500).json({
      success: false,
      message: 'Error subscribing to newsletter',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Unsubscribe from newsletter
// @route   DELETE /api/newsletter/:email
// @access  Public
exports.unsubscribe = async (req, res) => {
  try {
    const email = req.params.email;
    
    const subscriber = await Newsletter.findOne({ email });
    
    if (!subscriber) {
      return res.status(404).json({
        success: false,
        message: 'Email not found in our subscription list'
      });
    }
    
    subscriber.subscribed = false;
    subscriber.unsubscribedAt = Date.now();
    await subscriber.save();
    
    res.status(200).json({
      success: true,
      message: 'Successfully unsubscribed from the newsletter'
    });
  } catch (error) {
    console.error('Error unsubscribing from newsletter:', error);
    res.status(500).json({
      success: false,
      message: 'Error unsubscribing from newsletter',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get all newsletter subscribers
// @route   GET /api/newsletter
// @access  Private (Admin only)
exports.getSubscribers = async (req, res) => {
  try {
    const subscribers = await Newsletter.find()
      .sort({ subscribedAt: -1 });
    
    res.status(200).json({
      success: true,
      count: subscribers.length,
      data: subscribers
    });
  } catch (error) {
    console.error('Error fetching newsletter subscribers:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching newsletter subscribers',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}; 